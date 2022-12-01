scp -i ~/.ssh/id_rsa server users.json tweets.json root@139.144.20.231:/home/ahussain/server
ssh root@139.144.20.231
cd ../home/ahussain
chmod +x server/server
exit