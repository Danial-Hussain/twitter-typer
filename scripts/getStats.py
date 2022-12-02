import os
import json
import redis
import datetime
from dotenv import load_dotenv

load_dotenv(".env")

today = datetime.date.isoformat(datetime.date.today())

REDIS_HOST = os.getenv("REDIS_ADDR")
REDIS_PORT = os.getenv("REDIS_PORT")
REDIS_PASS = os.getenv("REDIS_PASS")
REDIS_DB_NUM = os.getenv("REDIS_DB")

r = redis.Redis(
   host=REDIS_HOST,
   port=REDIS_PORT,
   password=REDIS_PASS,
   db=REDIS_DB_NUM,
)

stats = r.get("Stats")
stats_json = json.loads(stats)

result = {
   "date": today,
   "gamesCreated": stats_json.get("gamesCreated", 0),
   "accountsCreated": stats_json.get("accountsCreated", 0)
}

with open("stats.json", "r+") as f:
   file_data = json.load(f)
   file_data["stats"].append(result)
   f.seek(0)
   json.dump(file_data, f, indent=4)