package database

const (
	KeyboardPrefix = "Keyboard:"
	PlayerPrefix   = "Player:"
	TweetPrefix    = "Tweet:"
	GuestPrefix    = "Guest:"
	GamePrefix     = "Game:"
	GameQueueKey   = "Queue"
	StatsKey       = "Stats"
)

type PlayerRedis struct {
	Id                 string       `json:"id"`
	Name               string       `json:"name"`
	Email              string       `json:"email"`
	Picture            string       `json:"picture"`
	AvgAccruacy        float64      `json:"avgAccuracy"`
	AvgSpeed           float64      `json:"avgSpeed"`
	BestSpeed          float64      `json:"bestSpeed"`
	MatchesPlayed      int          `json:"matchesPlayed"`
	MatchesWon         int          `json:"matchesWon"`
	Points             float64      `json:"points"`
	SelectedKeyboardId int          `json:"selectedKeyboardId"`
	KeyboardsOwned     map[int]bool `json:"keyboardsOwned"`
}

type GameRedis struct {
	Id      string          `json:"id"`
	State   string          `json:"state"`
	Players map[string]bool `json:"players"`
}

type Stats struct {
	GamesCreated    uint64 `json:"gamesCreated"`
	AccountsCreated uint64 `json:"accountsCreated"`
}