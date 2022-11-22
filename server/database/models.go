package database

const (
	KeyboardPrefix = "Keyboard:"
	PlayerPrefix   = "Player:"
	TweetPrefix    = "Tweet:"
	GuestPrefix    = "Guest:"
	GamePrefix     = "Game:"
)

type PlayerRedis struct {
	Id             string          `json:"id"`
	Name           string          `json:"name"`
	Email          string          `json:"email"`
	Picture        string          `json:"picture"`
	AvgAccruacy    float64         `json:"avgAccuracy"`
	AvgSpeed       float64         `json:"avgSpeed"`
	BestSpeed      int             `json:"bestSpeed"`
	MatchesPlayed  int             `json:"matchesPlayed"`
	MatchesWon     int             `json:"matchesWon"`
	Points         int             `json:"points"`
	KeyboardsOwned map[string]bool `json:"keyboardsOwned"`
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