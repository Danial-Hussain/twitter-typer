package database

const (
	KeyboardPrefix = "Keyboard:"
	PlayerPrefix   = "Player:"
	TweetPrefix    = "Tweet:"
	GuestPrefix    = "Guest:"
	GamePrefix     = "Game:"
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
	KeyboardsOwned     map[int]bool `json:"keyboardsOwned"` // the value indicates whether the keyboard is enabled
}

type GameRedis struct {
	Id         string          `json:"id"`
	State      string          `json:"state"`
	TweetId    string          `json:"tweetId"`
	CreatorId  string          `json:"creator"`
	MaxPlayers int             `json:"maxPlayers"`
	TimeLimit  int             `json:"timeLimit"`
	Players    map[string]bool `json:"players"`
}