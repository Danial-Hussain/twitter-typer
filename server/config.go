package main

import (
	"log"
	"os"

	dotenv "github.com/joho/godotenv"
)

type Config struct {
	HTTPServerAddress string
	AccessTokenKey    string
	RedisConnString   string
}

var Conf *Config

func init() {
	if err := dotenv.Load(".env"); err != nil {
		log.Fatal("failed to load environment variables")
	}

	http_addr := os.Getenv("HTTP_SERVER_ADDRESS")
	access_token_key := os.Getenv("TOKEN_KEY")
	redis_conn_string := os.Getenv("REDIS_CONN")

	var config Config
	config.HTTPServerAddress = http_addr
	config.AccessTokenKey = access_token_key
	config.RedisConnString = redis_conn_string
	Conf = &config
}