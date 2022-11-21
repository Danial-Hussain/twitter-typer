package controller

import (
	"encoding/json"
	"errors"
	"net/http"
	"server/config"
	"server/database"

	"github.com/go-redis/redis/v8"
	"github.com/golang-jwt/jwt/v4"
	uuid "github.com/satori/go.uuid"
)

type SigninBody struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Picture string `json:"picture"`
}

func SigninHandler(w http.ResponseWriter, r *http.Request) {
	var user_info SigninBody

	if err := json.NewDecoder(r.Body).Decode(&user_info); err != nil {
		http.Error(w, "Unable to parse json", http.StatusBadRequest)
		return
	}

	key := database.PlayerPrefix + user_info.Email

	if err := database.RedisClient.Get(database.Ctx, key).Err(); err == redis.Nil {
		if _, err := database.CreatePlayerRedis(user_info.Name, user_info.Email, user_info.Picture); err != nil {
			http.Error(w, "Unable to create user", http.StatusBadRequest)
			return
		}
	}

	if token, err := CreateJWT(key); err != nil {
		http.Error(w, "failed to create jwt", http.StatusBadRequest)
	} else {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(token)
	}
}


type JWTClaims struct {
	Id string
	jwt.RegisteredClaims
}

func CreateJWT(id string) (string, error) {
	claims := JWTClaims{id, jwt.RegisteredClaims{}}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	key := config.Conf.AccessTokenKey

	if token_str, err := token.SignedString([]byte(key)); err != nil {
		return "", err
	} else {
		return token_str, nil
	}
}


func ParseJWT(token_str string) (*JWTClaims, error) {
	key := config.Conf.AccessTokenKey

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


func PlayerOrGuest(token string) string {
	claims, err := ParseJWT(token)

	var player_id string

	if err != nil {
		// Guest player
		player_id = database.GuestPrefix + uuid.NewV4().String()
	} else {
		// Player already exists
		player_id = claims.Id
	}

	return player_id
}