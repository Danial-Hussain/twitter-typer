package middleware

import (
	"context"
	"net/http"
	"server/controller"
	"strings"
)

func PlayerCtx(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		reqToken := r.Header.Get("Authorization")

		reqSplit := strings.Split(reqToken, "Bearer ")
		
		if len(reqSplit) != 2 {
			reqToken = ""
		} else {
			reqToken = reqSplit[1]
		}

		var player_id string = controller.PlayerOrGuest(reqToken)
		
		ctxWithUser := context.WithValue(r.Context(), "player", player_id)
		rWithUser := r.WithContext(ctxWithUser)
		next.ServeHTTP(w, rWithUser)
	})
}