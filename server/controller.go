package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/golang-jwt/jwt/v4"
	"github.com/gorilla/websocket"
)

func WebSocketHandler(w http.ResponseWriter, r *http.Request) {
	id, err_id := strconv.Atoi(r.URL.Query().Get("id"))

	if err_id != nil {
		http.NotFound(w, r)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		http.Error(w, "failed to create connection", 400)
		return
	}
	
	var game *Game = Games[id]
	var player_id int = len(game.Players)
	var message map[string]*json.RawMessage
	
	defer conn.Close()
	
	for {
		// How will you handle the case where someone leaves the game after lobby
		// Maybe set them as completed and their points to zero?
		if err = conn.ReadJSON(&message); err != nil {
			if websocket.IsUnexpectedCloseError(err) {
				game.unregisterPlayer(player_id)
				game.sendActivePlayers(player_id)
				break
			}	
		}
			
		var action string
		if err := json.Unmarshal(*message["action"], &action); err != nil {
			fmt.Println(err)
			continue
		}

		if action == "ping" {
			pong(conn)
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

func CreateGameHandler(w http.ResponseWriter, r *http.Request) {
	game := NewGame()
	Games[game.Id] = game
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(game.Id)
}

func JoinGameHandler(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.URL.Query().Get("id"))

	if err != nil {
		http.Error(w, "invalid code", 400)
		return
	}

	if _, ok := Games[id]; !ok {
		http.Error(w, "invalid code", 400)
		return
	}

	if Games[id].State != Lobby {
		http.Error(w, "game has already started", 400)
		return
	}

	w.WriteHeader(http.StatusOK)
}


func JoinRandomHandler(w http.ResponseWriter, r *http.Request) {
	// Try to join a game that has started in the past 10 seconds
	// Otherwise create a new game
}

func pong(conn *websocket.Conn) {
	var result Response
	result.Action = "pong"

	if result_json, err := json.Marshal(result); err == nil {
		conn.WriteMessage(websocket.TextMessage, result_json)
	} 
}

type SigninBody struct {
	Name  string  `json:"name"`
	Email string `json:"email"`
	Picture string `json:"picture"`
}

func SigninHandler(w http.ResponseWriter, r *http.Request) {
	var user_info SigninBody

	if err := json.NewDecoder(r.Body).Decode(&user_info); err != nil {
		http.Error(w, "Unable to parse json", http.StatusBadRequest)
		return
	}

	// If the user already exists -> create a jwt and send
	// If the user doesn't exist -> create the user and then send jwt
	type Response struct {
		Token        string    `json:"token"`
		Username     string    `json:"username"`
		GameResults  []string  `json:"gameResults"`
		Keyboards    []string  `json:"keyboards"`
	}

	username := "hello"
	gameResults := []string{}
	keyboards := []string{}

	if token, err := CreateJWT(username, &user_info); err != nil {
		http.Error(w, "failed to create jwt", http.StatusBadRequest)
	} else {
		var response Response
		response.Username = username
		response.Token = token
		response.GameResults = gameResults
		response.Keyboards = keyboards
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}

	

}

type JWTClaims struct {
	Username string
	SigninBody
	jwt.RegisteredClaims
}

func CreateJWT(username string, user *SigninBody) (string, error) {
	claims := JWTClaims{ username, *user, jwt.RegisteredClaims{} }
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	key := Conf.AccessTokenKey
	
	if token_str, err := token.SignedString([]byte(key)); err != nil {
		return "", err
	} else {
		return token_str, nil
	}
}

func ParseJWT(token_str string) (*JWTClaims, error) {
	key := Conf.AccessTokenKey

	token, err := jwt.ParseWithClaims(
		token_str, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
			return []byte(key), nil
		})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	} else {
		return nil, errors.New("invalid claims")
	}
}