package controller

import (
	"encoding/json"
	"fmt"
	"log"
	"server/database"
	"sort"
	"strings"
	"time"

	"github.com/gorilla/websocket"
)

type Response struct {
	Action string `json:"action"` 
	Data interface{} `json:"data"`
}


const (
	Typing           = "Typing"
	Guessing         = "Guessing"
	Completed        = "Completed"
	Lobby            = "Lobby"
	Countdown        = "Countdown"
	Started          = "Started"
	Finished         = "Finished"
	GuessPointsBonus = 10
	MaxPlayersInGame = 6
	RoundTimeLimit   = 30
)


type PlayerGameStatus struct {
	State            string
	Points           float64 
	Speed            float64
	Placement        int
	CorrectAnswers   int
	TypingEndTime    time.Time
	TypingStartTime  time.Time
	IncorrectAnswers int 
	CurrentLetterIdx int
}


func NewPlayerGameStatus() *PlayerGameStatus {
	return &PlayerGameStatus{
		Speed: 0,
		Points: 0, 
		Placement: 0,
		State: Typing,
		CorrectAnswers: 0, 
		IncorrectAnswers: 0, 
		CurrentLetterIdx: 0,
	}
}


type Player struct {
	Id      string
	Name    string
	Creator bool
	Conn    *websocket.Conn
	Status  PlayerGameStatus
	Keyboard Keyboard
}


func NewPlayer(
	id string, 
	name string, 
	creator bool, 
	conn *websocket.Conn, 
	keyboard Keyboard,
) *Player {
	return &Player{
		Id: id, 
		Name: name, 
		Conn: conn, 
		Creator: creator,
		Status: *NewPlayerGameStatus(),
		Keyboard: keyboard,
	}
}

type Game struct {
	Id            string
	Winner        string
	TimeLimit     int
	MaxPlayers    int
	State         string
	Tweet         string
	TweetWordCnt  int
	Author        string
	AuthorHandle  string
	AuthorChoices []string
	Players 	     map[string]*Player
}


func NewGame(player_id string) (*Game, error) {
	tweet_id, tweet, tweet_word_count, author, author_handle, choices := generateTweet()

	if game_id, err := database.CreateGameRedis(Lobby, tweet_id, player_id, MaxPlayersInGame, RoundTimeLimit); err != nil {
		return nil, err
	} else {
		game := Game{
			Id: game_id, 
			State: Lobby, 
			Tweet: tweet,
			Author: author,
			AuthorChoices: choices,
			TimeLimit: RoundTimeLimit,
			AuthorHandle: author_handle,
			MaxPlayers: MaxPlayersInGame,
			TweetWordCnt: tweet_word_count,
			Players: make(map[string]*Player), 
		}
		return &game, nil
	}
}


func (g *Game) broadcastMessage(message []byte) {
	for i := range g.Players {
		g.Players[i].Conn.WriteMessage(
			websocket.TextMessage, message,
		)
	}
}


func (g *Game) sendError(conn *websocket.Conn, player_id string, message string) {
	var result Response 
	result.Action = "error"
	result.Data = message

	result_json, err := json.Marshal(result)	
	if err != nil {
		return
	}

	conn.WriteMessage(websocket.TextMessage, result_json)
}


func (g *Game) registerPlayer(
	message map[string]*json.RawMessage, 
	conn *websocket.Conn, 
	player_id string, 
	keyboard Keyboard,
) {
	if len(g.Players) == g.MaxPlayers {
		g.sendError(conn, player_id, "Too many players")
		return
	}

	if g.State != Lobby {
		g.sendError(conn, player_id, "Game has already started")
		return
	}

	type Data struct {
		Name string `json:"name"`
	}

	var data Data
	err := json.Unmarshal(*message["data"], &data)
	if err != nil {
		log.Println(err)
		return
	}

	g.Players[player_id] = NewPlayer(player_id, data.Name, len(g.Players) == 0, conn, keyboard)
	database.AddPlayerToGameRedis(g.Id, player_id)
}


func (g *Game) unregisterPlayer(player_id string) {
	/*
		If the player leaves after the game has started should we still take their current stats?
	*/
	database.RemovePlayerFromGameRedis(g.Id, player_id)
	delete(g.Players, player_id)
}


func (g *Game) sendActivePlayers(player_id string) {
	type PlayerInfo struct {
		Name             string  `json:"name"`
		KeyboardLink     string  `json:"keyboardLink"`
		Speed            float64 `json:"speed"`
		Points           float64 `json:"points"`
		State            string  `json:"state"`
		IsUser           bool    `json:"isUser"`
		Placement        int     `json:"placement"`
		IsCreator        bool    `json:"isCreator"`
		CorrectAnswers   int     `json:"correctAnswers"`
		IncorrectAnswers int     `json:"incorrectAnswers"` 
		CurrentLetterIdx int     `json:"currentLetterIdx"`
	}
	
	for i := range g.Players {

		var result Response
		var player_info []PlayerInfo
		
		for j := range g.Players {
			player_info = append(
				player_info, 
				PlayerInfo{
					Name: g.Players[j].Name, 
					IsCreator: g.Players[j].Creator,
					Speed: g.Players[j].Status.Speed,
					State: g.Players[j].Status.State,
					Points: g.Players[j].Status.Points,
					Placement: g.Players[j].Status.Placement,
					IsUser: g.Players[i].Id == g.Players[j].Id,
					CorrectAnswers: g.Players[j].Status.CorrectAnswers,
					KeyboardLink: g.Players[j].Keyboard.ClientImageLink,
					IncorrectAnswers: g.Players[j].Status.IncorrectAnswers,
					CurrentLetterIdx: g.Players[j].Status.CurrentLetterIdx,
				})
		}

		result.Action = "sendActivePlayers"
		result.Data = player_info

		result_json, err := json.Marshal(result)	
		if err != nil {
			return
		}
		
		g.Players[i].Conn.WriteMessage(
			websocket.TextMessage, result_json,
		)
	}
}


func (g *Game) startCountdown(conn *websocket.Conn, player_id string)  { 
	if len(g.Players) == 1 {
		g.sendError(conn, player_id, "Can't start game with one player")
		return 
	}

	var result Response
	result.Action = "startCountdown"
	result.Data = Countdown

	result_json, err := json.Marshal(result)
	if err != nil {
		return 
	}

	g.State = Countdown
	g.broadcastMessage(result_json)
	database.UpdateGameStatusRedis(g.Id, Countdown)

	go func() {
		time.Sleep(10 * time.Second)
		g.startGame(conn, player_id)
	}()
}

func (g *Game) startGame(conn *websocket.Conn, player_id string) {
	var result Response 
	
	if g.State != Countdown {
		g.sendError(conn, player_id, "Not in countdown mode")
		return
	}

	result.Action = "startGame"
	tmp := make(map[string]interface{})
	tmp["state"] = Started
	tmp["tweet"] = g.Tweet
	tmp["authorChoices"] = g.AuthorChoices
	result.Data = tmp

	if result_json, err := json.Marshal(result); err == nil {
		g.State = Started
		g.broadcastMessage(result_json)
		database.UpdateGameStatusRedis(g.Id, Started)
	}

	for i := range g.Players {
		g.Players[i].Status.TypingStartTime = time.Now()
	}

	go func() {
		time.Sleep(time.Duration(g.TimeLimit) * time.Second)
		for i := range g.Players {
			if g.Players[i].Status.State == Typing {
				g.Players[i].Status.TypingEndTime = time.Now()
				g.Players[i].Status.State = Guessing
			}
		}
		g.sendActivePlayers(player_id)
	}()
}


func (g *Game) playerMove(message map[string]*json.RawMessage, conn *websocket.Conn, player_id string) {
	type Data struct {
		Key string `json:"key"`
	}

	if (g.Players[player_id].Status.State == Guessing || g.Players[player_id].Status.State == Completed) {
		return
	}

	var data Data
	if err := json.Unmarshal(*message["data"], &data); err != nil {
		log.Println(err)
		return
	}

	if data.Key == string(g.Tweet[g.Players[player_id].Status.CurrentLetterIdx]) {
		g.Players[player_id].Status.CurrentLetterIdx += 1		
		g.Players[player_id].Status.CorrectAnswers += 1
	} else if g.Players[player_id].Status.CurrentLetterIdx != len(g.Tweet) {
		g.Players[player_id].Status.IncorrectAnswers += 1
	}

	if g.Players[player_id].Status.CurrentLetterIdx == len(g.Tweet) {
		g.Players[player_id].Status.TypingEndTime = time.Now()
		g.Players[player_id].Status.State = Guessing
	}

	g.sendActivePlayers(player_id)
}


func (g *Game) playerGuess(message map[string]*json.RawMessage, conn *websocket.Conn, player_id string) {
	type Data struct {
		Guess string `json:"guess"`
	}

	if g.Players[player_id].Status.State == Completed {
		return
	}

	var data Data
	if err := json.Unmarshal(*message["data"], &data); err != nil {
		log.Println(err)
		return
	}

	if data.Guess == g.Author {
		g.Players[player_id].Status.Points += GuessPointsBonus
	}

	g.Players[player_id].Status.State = Completed
	g.sendActivePlayers(player_id)

	if g.countCompletedPlayers() == len(g.Players) {
		g.startFinish(player_id)
	}
}


func (g *Game) startFinish(player_id string) {
	if g.State != Started {
		return
	}

	g.State = Finished
	database.UpdateGameStatusRedis(g.Id, Finished)
	
	var player_points []map[string]interface{}

	for i := range g.Players {
		startTime := g.Players[i].Status.TypingStartTime
		endTime := g.Players[i].Status.TypingEndTime

		words := wordsCompleted(g.Tweet, g.Players[i].Status.CurrentLetterIdx)
		words_per_minute := float64(words) / endTime.Sub(startTime).Minutes()

		g.Players[i].Status.Points += words_per_minute
		g.Players[i].Status.Speed = words_per_minute

		val := make(map[string]interface{})
		val["id"] = g.Players[i].Id
		val["points"] = g.Players[i].Status.Points
		player_points = append(player_points, val)
	}

	sort.Slice(player_points, func(i, j int) bool { 
		return player_points[i]["points"].(float64) > player_points[j]["points"].(float64)
	})

	fmt.Println(player_points)

	for i := range player_points {
		player_id := player_points[i]["id"].(string)
		g.Players[player_id].Status.Placement = (i + 1) 

		correct := float64(g.Players[player_id].Status.CorrectAnswers)
		incorrect := float64(g.Players[player_id].Status.IncorrectAnswers)

		database.PlayerPlayedGameRedis(
			player_points[i]["id"].(string), 
			g.Players[player_id].Status.Speed, 
			correct / (correct + incorrect),
			g.Players[player_id].Status.Placement == 1, 
			g.Players[player_id].Status.Points + g.Players[player_id].Status.Speed, 
		)
	}

	g.Winner = player_points[0]["id"].(string)

	var result Response
	result.Action = "startFinish"
	tmp := make(map[string]interface{})
	tmp["state"] = Finished
	tmp["author"] = g.Author
	tmp["authorHandle"] = g.AuthorHandle
	result.Data = tmp
	
	if result_json, err := json.Marshal(result); err == nil {
		g.broadcastMessage(result_json)
	} 

	g.sendActivePlayers(player_id)
	g.removeGame()
}

func (g *Game) removeGame() {
	delete(Games, g.Id)
	database.DeleteGameRedis(g.Id)
}

func (g *Game) countCompletedPlayers() int {
	var count int = 0
	for i := range g.Players {
		if g.Players[i].Status.State == Completed {
			count += 1
		}
	}
	return count
}

func wordsCompleted(tweet string, currentIdx int) int {
	tweet_subset := tweet[0:currentIdx]
	words := len(strings.Split(tweet_subset, " "))
	if currentIdx + 1 < len(tweet) && string(tweet[currentIdx + 1]) != " " {
		words -= 1
	}
	return words
}