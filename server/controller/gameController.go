package controller

import (
	"encoding/json"
	"net/http"
	"server/database"
	"strings"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

var Games = make(map[string]*Game)

func JoinGameHandler(w http.ResponseWriter, r *http.Request) {
	game_id := database.GamePrefix + r.URL.Query().Get("id")

	if _, ok := Games[game_id]; !ok {
		http.Error(w, "invalid code", 400)
		return
	}

	if Games[game_id].State != Lobby {
		http.Error(w, "game has already started", 400)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func JoinRandomGameHandler(w http.ResponseWriter, r *http.Request) {
	player_id := r.Context().Value("player").(string)
	game_id, err := database.DequeueGame()

	if err != nil {
		// If there is no game the user can join -> create a new game and add to queue
		if game, err := NewGame(player_id, PrivateGame); err != nil {
			http.Error(w, "failed to create game", http.StatusBadRequest)
		} else {
			database.Queue(game.Id)
			Games[game.Id] = game
			shortened_game_id := strings.Split(game.Id, ":")[1]
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(shortened_game_id)
		}
	} else {
		// If there is a game the user can join -> return that game
		shortened_game_id := strings.Split(game_id, ":")[1]
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(shortened_game_id)
	}
}

func CreateGameHandler(w http.ResponseWriter, r *http.Request) {
	player_id := r.Context().Value("player").(string)

	if game, err := NewGame(player_id, PublicGame); err != nil {
		http.Error(w, "failed to create game", http.StatusBadRequest)
	} else {
		Games[game.Id] = game
		shortened_game_id := strings.Split(game.Id, ":")[1]
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(shortened_game_id)
	}
}

func GetAllKeyboardsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(Keyboards)
}


func WebSocketHandler(w http.ResponseWriter, r *http.Request) {
	game_id := database.GamePrefix + r.URL.Query().Get("id")
	token := r.URL.Query().Get("token")

	player_id, player_type := PlayerOrGuest(token)
	player_keyboard := Keyboards[0]

	if player_type == "player" {
		keyboard_id := database.GetPlayerSelectedKeyboard(player_id)
		player_keyboard = Keyboards[keyboard_id]
	} 

	conn, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		http.Error(w, "failed to create connection", 400)
		return
	}

	var game *Game = Games[game_id]
	var message map[string]*json.RawMessage

	defer conn.Close()

	for {
		if err = conn.ReadJSON(&message); err != nil {
			if websocket.IsUnexpectedCloseError(err) {
				game.unregisterPlayer(player_id)
				game.sendActivePlayers(player_id)
				if len(game.Players) == 0 {
					game.removeGame()
				}
				break
			}
		}

		var action string
		if err := json.Unmarshal(*message["action"], &action); err != nil {
			continue
		}

		if action == "ping" {
			var result Response
			result.Action = "pong"
			if result_json, err := json.Marshal(result); err == nil {
				conn.WriteMessage(websocket.TextMessage, result_json)
			} 
		}

		switch game.State {
		case Lobby:
			if action == "registerPlayer" {
				game.registerPlayer(message, conn, player_id, player_keyboard)
				game.sendActivePlayers(player_id)
			}

			if action == "startCountdown" {
				game.sendActivePlayers(player_id)
				game.startCountdown(conn, player_id)
			}

		case Started:
			if action == "playerMove" {
				game.playerMove(message, conn, player_id)
			}

			if action == "playerGuess" {
				game.playerGuess(message, conn, player_id)
			}

		case Finished:

		}
	}
}


func GetPlayerStatsHandler(w http.ResponseWriter, r *http.Request) {
	player_id := r.Context().Value("player").(string)
	result := database.GetPlayerStatsRedis(player_id)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)	
}


func GetPlayerKeyboardsHandler(w http.ResponseWriter, r *http.Request) {
	player_id := r.Context().Value("player").(string)
	result := database.GetPlayerKeyboardsRedis(player_id)
	var keyboards []struct{ Selected bool `json:"selected"`; Keyboard}

	for i := range result {
		keyboard_id := result[i].KeyboardId
		keyboards = append(keyboards, struct{ Selected bool `json:"selected"`; Keyboard }{
			Selected: result[i].Selected, 
			Keyboard: Keyboards[keyboard_id],
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(keyboards)	
}

func ChangePlayerNameHandler(w http.ResponseWriter, r *http.Request) {
	type Body struct {
		Name string `json:"name"`
	}

	var body Body
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		return
	}

	player_id := r.Context().Value("player").(string)
	database.ChangePlayerNameRedis(player_id, body.Name)
	w.WriteHeader(http.StatusOK)
}

func ChangePlayerKeyboardHandler(w http.ResponseWriter, r *http.Request) {
	type Body struct {
		KeyboardId int `json:"keyboardId"`
	}

	var body Body 
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		return
	}

	player_id := r.Context().Value("player").(string)
	database.ChangePlayerKeyboard(player_id, body.KeyboardId)
	w.WriteHeader(http.StatusOK)
}

func PlayerUnlockedKeyboardHandler(w http.ResponseWriter, r *http.Request) {
	player_id := r.Context().Value("player").(string)
	stats := database.GetPlayerStatsRedis(player_id)
	keyboards := database.GetPlayerKeyboardsRedis(player_id)
	keyboards_set := make(map[int]bool)
	keyboards_unlocked := []Keyboard{}

	for i := range keyboards {
		keyboards_set[keyboards[i].KeyboardId] = true
	}

	for i := range Keyboards {
		id := Keyboards[i].Id
		points_needed := Keyboards[i].PointsNeeded

		_, ok := keyboards_set[id]

		if  stats["Points"].(float64) >= float64(points_needed) && !ok {
			keyboards_unlocked = append(keyboards_unlocked, Keyboards[id])
			database.GrantPlayerKeyboard(player_id, id)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(keyboards_unlocked)	
}