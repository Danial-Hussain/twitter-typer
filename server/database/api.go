package database

import (
	"encoding/json"
	"errors"
	"time"

	uuid "github.com/satori/go.uuid"
)

func CreateGameRedis(
	state string, 
	tweet_id string, 
	creator string, 
	max_players int, 
	time_limit int,
) (string, error) {

	var game GameRedis
	id_str := GamePrefix + uuid.NewV4().String()

	game.Id = id_str
	game.State = state
	game.TweetId = tweet_id
	game.CreatorId = creator
	game.TimeLimit = time_limit
	game.MaxPlayers = max_players
	game.Players = make(map[string]bool)

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

func AddPlayerToGameRedis(game_id string, player_id string) error {
	data, err := RedisClient.Get(Ctx, game_id).Result()

	if err != nil {
		return err
	}

	var game GameRedis
	if err = json.Unmarshal([]byte(data), &game); err != nil {
		return err
	}

	game.Players[player_id] = true

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
	player.AvgAccruacy = 0
	player.MatchesPlayed = 0
	player.SelectedKeyboardId = 0
	player.KeyboardsOwned = make(map[int]bool)
	player.KeyboardsOwned[0] = true

	if player_json, err := json.Marshal(player); err != nil {
		return "", err
	} else {
		return id, RedisClient.Set(Ctx, id, player_json, 0).Err()
	}
}

func PlayerPlayedGameRedis(player_id string, speed float64, accuracy float64, won bool, points float64) error {
	data, err := RedisClient.Get(Ctx, player_id).Result()

	if err != nil {
		return err
	}

	var player PlayerRedis
	if err = json.Unmarshal([]byte(data), &player); err != nil {
		return err
	}

	player.AvgAccruacy = player.AvgAccruacy + ((accuracy - player.AvgAccruacy) / (float64(player.MatchesPlayed + 1)))
	player.AvgSpeed = player.AvgSpeed + ((float64(speed) - player.AvgSpeed) / (float64(player.MatchesPlayed + 1)))

	player.Points += points
	if speed > player.BestSpeed { player.BestSpeed = speed }

	player.MatchesPlayed += 1
	if won { player.MatchesWon += 1 }

	
	if player_json, err := json.Marshal(player); err != nil {
		return err
	} else {
		return RedisClient.Set(Ctx, player_id, player_json, 0).Err()
	}
}

func GetPlayerStatsRedis(player_id string) map[string]interface{} {
	result := make(map[string]interface{})

	data, err := RedisClient.Get(Ctx, player_id).Result()

	if err != nil {
		return result
	}

	var player PlayerRedis
	if err = json.Unmarshal([]byte(data), &player); err != nil {
		return result
	}

	result["Points"] = player.Points
	result["AvgSpeed"] = player.AvgSpeed
	result["BestSpeed"] = player.BestSpeed
	result["MatchesWon"] = player.MatchesWon 
	result["AvgAccuracy"] = player.AvgAccruacy
	result["MatchesPlayed"] = player.MatchesPlayed

	return result
}

func GetPlayerSelectedKeyboard(player_id string) int {
	data, err := RedisClient.Get(Ctx, player_id).Result()

	if err != nil {
		return 0
	}

	var player PlayerRedis
	if err = json.Unmarshal([]byte(data), &player); err != nil {
		return 0
	}	
	
	return player.SelectedKeyboardId
}

func GetPlayerKeyboardsRedis(player_id string) []struct{ KeyboardId int; Selected bool} {
	result := []struct{ KeyboardId int; Selected bool}{}

	data, err := RedisClient.Get(Ctx, player_id).Result()

	if err != nil {
		return result
	}

	var player PlayerRedis
	if err = json.Unmarshal([]byte(data), &player); err != nil {
		return result
	}

	for i := range player.KeyboardsOwned {
		result = append(
			result, 
			struct{ KeyboardId int; Selected bool}{
				KeyboardId: i, 
				Selected: i == player.SelectedKeyboardId,
			 },
		)
	}

	return result
}

func ChangePlayerNameRedis(player_id, new_name string) error {
	data, err := RedisClient.Get(Ctx, player_id).Result()

	if err != nil {
		return err
	}

	var player PlayerRedis
	if err = json.Unmarshal([]byte(data), &player); err != nil {
		return err
	}

	player.Name = new_name

	if player_json, err := json.Marshal(player); err != nil {
		return err
	} else {
		return RedisClient.Set(Ctx, player_id, player_json, 0).Err()
	}
}

func ChangePlayerKeyboard(player_id string, new_keyboard_id int) error {
	data, err := RedisClient.Get(Ctx, player_id).Result()

	if err != nil {
		return err
	}

	var player PlayerRedis
	if err = json.Unmarshal([]byte(data), &player); err != nil {
		return err
	}

	if _, ok := player.KeyboardsOwned[new_keyboard_id]; ok {
		player.SelectedKeyboardId = new_keyboard_id
	}

	if player_json, err := json.Marshal(player); err != nil {
		return err
	} else {
		return RedisClient.Set(Ctx, player_id, player_json, 0).Err()
	}
}

func GrantPlayerKeyboard(player_id string, keyboard_id int) error {
	data, err := RedisClient.Get(Ctx, player_id).Result()

	if err != nil {
		return err
	}

	var player PlayerRedis
	if err = json.Unmarshal([]byte(data), &player); err != nil {
		return err
	}

	player.KeyboardsOwned[keyboard_id] = true
	
	if player_json, err := json.Marshal(player); err != nil {
		return err
	} else {
		return RedisClient.Set(Ctx, player_id, player_json, 0).Err()
	}
}

func DequeueGame() (string, error) {	
	maxIter := 100

	for {
		// We have checked 100 games
		if maxIter -= 1; maxIter == 0 {
			return "", errors.New("failed to find game")
		}

		// Get the first game from the queue
		game_id, err := RedisClient.LIndex(Ctx, GameQueue, 0).Result()
		if err != nil {
			return "", err
		}

		// Get the game json string
		game_str, err := RedisClient.Get(Ctx, game_id).Result()
		if err != nil {
			RedisClient.LPop(Ctx, GameQueue).Result()
			continue
		}

		// Get the game data
		var game GameRedis
		if err = json.Unmarshal([]byte(game_str), &game); err != nil {
			RedisClient.LPop(Ctx, GameQueue).Result()
			continue
		}

		// Check if the game is in the right state
		if game.State != "Lobby" {
			RedisClient.LPop(Ctx, GameQueue).Result()
			continue
		}

		// Check if the game doesn't have too many players or too little players
		if len(game.Players) == 0 || len(game.Players) == 6 {
			RedisClient.LPop(Ctx, GameQueue).Result()
			continue
		}

		return game_id, nil	
	}
}

func Queue(game_id string) error {	
	_, err := RedisClient.RPush(Ctx, GameQueue, game_id).Result()
	return err
}