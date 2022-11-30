package config

import (
	"log"
	"os"

	dotenv "github.com/joho/godotenv"
)

type Config struct {
	HTTPServerAddress string
	AccessTokenKey    string
	RedisAddress      string
	RedisPassword     string
}

var Conf *Config

func init() {
	if err := dotenv.Load(".env"); err != nil {
		log.Fatal("failed to load environment variables")
	}

	http_addr := os.Getenv("HTTP_SERVER_ADDRESS")
	access_token_key := os.Getenv("TOKEN_KEY")
	redis_address := os.Getenv("REDIS_ADDR")
	redis_password := os.Getenv("REDIS_PASS")

	var config Config
	config.HTTPServerAddress = http_addr
	config.AccessTokenKey = access_token_key
	config.RedisAddress = redis_address
	config.RedisPassword = redis_password
	Conf = &config
}