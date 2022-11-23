package controller

import "strings"

func generateTweet() (string, string, int, string, string, []string) {
	id := "TweetPrefix:1"
	author_choices := []string{"Elon Musk", "Tom Brady", "Michael Jordan", "LeBron James"}
	author_handle := "elonmusk"
	author := "Elon Musk"
	tweet := "Hello World"
	words := len(strings.Split(tweet, " "))
	return id, tweet, words, author, author_handle, author_choices
}