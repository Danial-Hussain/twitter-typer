package database

import (
	"context"
	"log"
	"server/config"

	"github.com/go-redis/redis/v8"
	dotenv "github.com/joho/godotenv"
)

var Ctx = context.Background()
var RedisClient *redis.Client

func init() {
	if err := dotenv.Load(".env"); err != nil {
		log.Fatal("failed to connect to redis")
	}

	client := redis.NewClient(&redis.Options{
		Addr: config.Conf.RedisAddress,
		Password: config.Conf.RedisPassword,
		DB: 0,
	})

	if _, err := client.Ping(Ctx).Result(); err != nil {
		log.Fatal(err)
	}
	
	RedisClient = client
	log.Println("Connected to redis...")
}