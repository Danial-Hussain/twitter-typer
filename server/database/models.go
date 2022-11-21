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
	AvgSpeed       float64         `json:"avgSpeed"`
	BestSpeed      int             `json:"bestSpeed"`
	MatchesPlayed  int             `json:"matchesPlayed"`
	MatchesWon     int             `json:"matchesWon"`
	Points         int             `json:"points"`
	KeyboardsOwned map[string]bool `json:"keyboardsOwned"`
}

type PlayerGameRedis struct {
	Id        string  `json:"id"`
	Placement int     `json:"placement"`
	Points    int     `json:"points"`
	Accuracy  float64 `json:"accuracy"`
}

type GameRedis struct {
	Id         string                     `json:"id"`
	State      string                     `json:"state"`
	TweetId    string                     `json:"tweetId"`
	CreatorId  string                     `json:"creator"`
	MaxPlayers int                        `json:"maxPlayers"`
	TimeLimit  int                        `json:"timeLimit"`
	Players    map[string]PlayerGameRedis `json:"players"`
}