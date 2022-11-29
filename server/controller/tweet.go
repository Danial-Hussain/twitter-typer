package controller

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math/rand"
	"os"
	"strings"
	"time"
)

var Tweets *[]Tweet = &[]Tweet{}
var TweetAuthors *[]TweetAuthor = &[]TweetAuthor{}

type TweetAuthor struct {
	Name     string `json:"name"`
	UserId   int    `json:"user_id"`
	Username string `json:"username"`
}

type Tweet struct {
	AuthorName     string `json:"tweet_author_name"`
	AuthorUsername string `json:"tweet_author_username"`
	Link           string `json:"tweet_link"`
	Content        string `json:"tweet_text"`
}

func generateTweet() (string, string, int, string, string, []string) {
	rand.Seed(time.Now().UnixNano())
	tweet_count := len(*Tweets)
	tweet_number := rand.Intn(tweet_count)
	tweet := (*Tweets)[tweet_number]
	author_choices := []string{tweet.AuthorName}

	for {
		author_count := len(*TweetAuthors)
		author_number := rand.Intn(author_count)
		author := (*TweetAuthors)[author_number]
		if author.Username == tweet.AuthorUsername {
			continue
		}
		author_choices = append(author_choices, author.Name)
		if len(author_choices) == 4 {
			break
		}
	}

	author := tweet.AuthorName
	tweet_content := tweet.Content
	author_handle := tweet.AuthorUsername
	words := len(strings.Split(tweet.Content, " "))
	id := fmt.Sprintf("TweetPrefix:%d", tweet_number)
	return id, tweet_content, words, author, author_handle, author_choices
}

func init() {
	// Load twitter users data
	tweet_authors_json, err := os.Open("users.json")
	if err != nil {
		log.Fatal(err)
	}
	defer tweet_authors_json.Close()
	
	tweet_authors_byte, _ := ioutil.ReadAll(tweet_authors_json)
	if err := json.Unmarshal(tweet_authors_byte, TweetAuthors); err != nil {
		log.Fatal(err)
	}

	// Load tweets data
	tweets_json, err := os.Open("tweets.json")
	if err != nil {
		log.Fatal(err)
	}
	defer tweets_json.Close()

	tweets_json_byte, _ := ioutil.ReadAll(tweets_json)
	if err := json.Unmarshal(tweets_json_byte, Tweets); err != nil {
		log.Fatal(err)
	}

	fmt.Println("Finished loading tweet json files")
}