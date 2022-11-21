package controller

func generateTweet() (string, string, string, string, []string) {
	id := "TweetPrefix:1"
	author_choices := []string{"Elon Musk", "Tom Brady", "Michael Jordan", "LeBron James"}
	author_handle := "elonmusk"
	author := "Elon Musk"
	tweet := "Hello World"
	return id, tweet, author, author_handle, author_choices
}