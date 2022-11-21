package database

import (
	"encoding/json"
	"time"

	uuid "github.com/satori/go.uuid"
)

func CreateGameRedis(state string, tweet_id string, creator string, max_players int, time_limit int) (string, error) {
	var game GameRedis
	id_str := GamePrefix + uuid.NewV4().String()

	game.Id = id_str
	game.State = state
	game.TweetId = tweet_id
	game.CreatorId = creator
	game.TimeLimit = time_limit
	game.MaxPlayers = max_players
	game.Players = make(map[string]PlayerGameRedis)

	if game_json, err := json.Marshal(game); err != nil {
		return "", err
	} else {
		return id_str, RedisClient.Set(Ctx, id_str, game_json, time.Hour).Err()
	}
}

func DeleteGameRedis(game_id string) error {
	return RedisClient.Del(Ctx, game_id).Err()
}

func UpdateGameStatusRedis(game_id string, state string) error {
	data, err := RedisClient.Get(Ctx, game_id).Result()

	if err != nil {
		return err
	}

	var game GameRedis
	if err = json.Unmarshal([]byte(data), &game); err != nil {
		return err
	}

	game.State = state 

	if game_json, err := json.Marshal(game); err != nil {
		return err
	} else {
		err = RedisClient.Set(Ctx, game_id, game_json, 0).Err()
		return err
	}
}

func AddPlayerToGameRedis(game_id string, player_id string, placement int, points int, accuracy float64) error {
	var player_game PlayerGameRedis
	player_game.Id = player_id
	player_game.Placement = placement
	player_game.Points = points
	player_game.Accuracy = accuracy

	data, err := RedisClient.Get(Ctx, game_id).Result()

	if err != nil {
		return err
	}

	var game GameRedis
	if err = json.Unmarshal([]byte(data), &game); err != nil {
		return err
	}

	game.Players[player_id] = player_game

	if game_json, err := json.Marshal(game); err != nil {
		return err
	} else {
		err = RedisClient.Set(Ctx, game_id, game_json, 0).Err()
		return err
	}
}

func RemovePlayerFromGameRedis(game_id string, player_id string) error {
	data, err := RedisClient.Get(Ctx, game_id).Result()

	if err != nil {
		return err
	}

	var game GameRedis
	if err = json.Unmarshal([]byte(data), &game); err != nil {
		return err
	}

	delete(game.Players, player_id)

	if game_json, err := json.Marshal(game); err != nil {
		return err
	} else {
		err = RedisClient.Set(Ctx, game_id, game_json, 0).Err()
		return err
	}
}

func CreatePlayerRedis(name string, email string, picture string) (string, error) {
	var player PlayerRedis
	id := PlayerPrefix + email

	player.Id = id
	player.Points = 0
	player.Name = name
	player.Email = email
	player.Picture = picture
	player.AvgSpeed = 0
	player.BestSpeed = 0
	player.MatchesWon = 0
	player.MatchesPlayed = 0
	player.KeyboardsOwned = make(map[string]bool )

	if player_json, err := json.Marshal(player); err != nil {
		return "", err
	} else {
		return id, RedisClient.Set(Ctx, id, player_json, 0).Err()
	}
}

// func PlayerPlayedGameRedis(player_id string, game_id string) error {
// 	data, err := RedisClient.Get(Ctx, player_id).Result()

// 	if err != nil {
// 		return err
// 	}

// 	var player PlayerRedis
// 	if err = json.Unmarshal([]byte(data), &player); err != nil {
// 		return err
// 	}

// 	if player_json, err := json.Marshal(player); err != nil {
// 		return err
// 	} else {
// 		return RedisClient.Set(Ctx, player_id, player_json, 0).Err()
// 	}
// }