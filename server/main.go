package main

import (
	"net/http"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {return true},
}

var Games = make(map[int]*Game)

func main() {	
	headersOk := handlers.AllowedHeaders([]string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"})
	originsOk := handlers.AllowedOrigins([]string{"http://localhost:5173", "https://localhost:5173"})
	methodsOk := handlers.AllowedMethods([]string{"GET", "HEAD", "POST", "PUT", "OPTIONS"})

	r := mux.NewRouter()
	r.HandleFunc("/ws", WebSocketHandler)
	r.HandleFunc("/signin", SigninHandler).Methods("POST")
	r.HandleFunc("/joinGame", JoinGameHandler).Methods("GET")
	r.HandleFunc("/joinRandom", JoinRandomHandler).Methods("GET")
	r.HandleFunc("/createGame", CreateGameHandler).Methods("POST")
	http.ListenAndServe("127.0.0.1:8080", handlers.CORS(originsOk, headersOk, methodsOk)(r))
}