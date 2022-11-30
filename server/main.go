package main

import (
	"net/http"
	"server/controller"
	"server/middleware"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

func main() {	
	headersOk := handlers.AllowedHeaders([]string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"})
	methodsOk := handlers.AllowedMethods([]string{"GET", "HEAD", "POST", "PUT", "OPTIONS"})
	originsOk := handlers.AllowedOrigins([]string{
		"http://localhost:5173", 
		"https://localhost:5173", 
		"http://twittertyper.tech", 
		"https://twittertyper.tech",
	})

	r := mux.NewRouter()
	r.HandleFunc("/ws", controller.WebSocketHandler)
	r.HandleFunc("/signin", controller.SigninHandler).Methods("POST")
	r.HandleFunc("/joinGame", controller.JoinGameHandler).Methods("Get")
	r.HandleFunc("/keyboards", controller.GetAllKeyboardsHandler).Methods("GET")
	
	// Requires player context
	r.Handle("/createGame", middleware.PlayerCtx(
		http.HandlerFunc(controller.CreateGameHandler)),
	).Methods("POST")

	r.Handle("/joinRandomGame", middleware.PlayerCtx(
		http.HandlerFunc(controller.JoinRandomGameHandler)),
	).Methods("POST")

	r.Handle("/playerStats", middleware.PlayerCtx(
		http.HandlerFunc(controller.GetPlayerStatsHandler)),
	).Methods("GET")
	
	r.Handle("/changeName", middleware.PlayerCtx(
		http.HandlerFunc(controller.ChangePlayerNameHandler)),
	).Methods("POST")
	
	r.Handle("/playerKeyboards", middleware.PlayerCtx(
		http.HandlerFunc(controller.GetPlayerKeyboardsHandler)),
	).Methods("GET")
	
	r.Handle("/changeKeyboard", middleware.PlayerCtx(
		http.HandlerFunc(controller.ChangePlayerKeyboardHandler)),
	).Methods("POST")
	
	r.Handle("/unlockedKeyboards", middleware.PlayerCtx(
		http.HandlerFunc(controller.PlayerUnlockedKeyboardHandler)),
	).Methods("GET")
	
	http.ListenAndServe("127.0.0.1:8080", handlers.CORS(originsOk, headersOk, methodsOk)(r))
}