package main

func generateTweet() (string, string, string, []string) {
	author_choices := []string{"Elon Musk", "Tom Brady", "Michael Jordan", "LeBron James"}
	author_handle := "elonmusk"
	author := "Elon Musk"
	tweet := "Hello World"
	return tweet, author, author_handle, author_choices
}