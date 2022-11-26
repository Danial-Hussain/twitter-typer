import os
import json
import tweepy
from accounts import accounts
from dotenv import load_dotenv
from profanity_check import predict

load_dotenv(".env")

bearer = os.environ["BEARER_TOKEN"]

client = tweepy.Client(bearer_token=bearer)

results = []
users = []

for account in accounts:
   try:
      user = client.get_user(username=account)
      name = user.data.name
      user_id = user.data.id
      username = user.data.username
   except:
      print(f'Get User Failed for: {account}')

   users.append({
      "name": name,
      "user_id": user_id,
      "username": username
   })

   try:
      response = client.get_users_tweets(
         id=user_id, 
         max_results=50,
         tweet_fields="public_metrics",
         exclude=["replies", "retweets"], 
      )

      data = []

      for tweet in response.data:
         tweet_id = tweet.id
         content = tweet.text.encode("ascii", "ignore").decode().replace("\n", "")
         likes = tweet.public_metrics.get("like_count", 0)

         # Tweet contains profanity
         if predict([content])[0] == 1:
            continue

         # Tweets must contain 120 characters
         if len(content) < 120:
            continue

         # Tweet should not contain @ or link
         if content.find("@") != -1 or content.find("http") != -1:
            continue

         data.append({
            "tweet_author_name": name, 
            "tweet_author_username": username, 
            "tweet_link": f"https://twitter.com/{username}/status/{tweet_id}",
            "tweet_text": content,
            "tweet_likes": likes,
         })   
   except:
      print(f'Get Tweets Failed for: {account}')

   data = sorted(data, key = lambda x: x["tweet_likes"], reverse=True)[0:5]
   results += data

users_json = json.dumps(users)
tweets_json = json.dumps(results)

with open("../server/users.json", "w") as outfile:
   outfile.write(users_json)

with open("../server/tweets.json", "w") as outfile:
    outfile.write(tweets_json)