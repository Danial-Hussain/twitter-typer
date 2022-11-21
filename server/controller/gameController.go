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

func JoinRandomHandler(w http.ResponseWriter, r *http.Request) {
	// Check in the queue for a game that has started in the past 10 seconds
	// Otherwise create a new game and add to the queue
	// The queue should expire games after 10 seconds
}

func CreateGameHandler(w http.ResponseWriter, r *http.Request) {
	player_id := r.Context().Value("player").(string)

	if game, err := NewGame(player_id); err != nil {
		http.Error(w, "failed to create game", http.StatusBadRequest)
	} else {
		Games[game.Id] = game
		shortened_game_id := strings.Split(game.Id, ":")[1]
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(shortened_game_id)
	}
}

func WebSocketHandler(w http.ResponseWriter, r *http.Request) {
	game_id := database.GamePrefix + r.URL.Query().Get("id")
	token := r.URL.Query().Get("token")

	player_id := PlayerOrGuest(token)

	conn, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		http.Error(w, "failed to create connection", 400)
		return
	}

	var game *Game = Games[game_id]
	var message map[string]*json.RawMessage

	defer conn.Close()

	for {
		// How will you handle the case where someone leaves the game after lobby
		// Maybe set them as completed and their points to zero?
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
				game.registerPlayer(message, conn, player_id)
				game.sendActivePlayers(player_id)
			}

			if action == "startCountdown" {
				game.sendActivePlayers(player_id)
				game.startCountdown(conn, player_id)
			}

		case Countdown:
			if action == "startGame" {
				game.startGame(conn, player_id)
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


func GetPlayerKeyboardsHandler(w http.ResponseWriter, r *http.Request) {

}

func GetPlayerMatchResultsHandler(w http.ResponseWriter, r *http.Request) {

}