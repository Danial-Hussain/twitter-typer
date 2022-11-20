package main

import (
	"context"
	"log"

	"github.com/go-redis/redis/v8"
	dotenv "github.com/joho/godotenv"
)

var Ctx = context.Background()
var RedisClient *redis.Client

const (
	KeyboardPrefix = "Keyboard"
	TweetPrefix    = "Tweet"
	PlayerPrefix   = "Player"
	GamePrefix     = "Game"
)

func init() {
	if err := dotenv.Load(".env"); err != nil {
		log.Fatal("failed to connect to redis")
	}
	redis_conn := Conf.RedisConnString
	opt, _ := redis.ParseURL(redis_conn)
	client := redis.NewClient(opt)
	RedisClient = client
	log.Println("Connected to redis...")
}