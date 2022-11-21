package database

import (
	"context"
	"log"

	"github.com/go-redis/redis/v8"
	dotenv "github.com/joho/godotenv"
)

var Ctx = context.Background()
var RedisClient *redis.Client

func init() {
	if err := dotenv.Load(".env"); err != nil {
		log.Fatal("failed to connect to redis")
	}
	// redis_conn := config.Conf.RedisConnString
	// opt, _ := redis.ParseURL(redis_conn)
	// client := redis.NewClient(opt)

	client := redis.NewClient(&redis.Options{
		Addr: "127.0.0.1:6379",
		Password: "",
		DB: 0,
	})

	if _, err := client.Ping(Ctx).Result(); err != nil {
		log.Fatal(err)
	}
	
	RedisClient = client
	log.Println("Connected to redis...")
}