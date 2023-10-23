#!/usr/bin/env bash



[ ! "$(docker ps -a | grep postgres)" ] && docker run -d -p 5555:5432 -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=123 -e POSTGRES_DB=hma --name hma_db \
    -v db:/var/lib/postgresql/data postgres

cd shared/libs/prisma 

sleep 1m

npm run deploy

[ ! "$(docker ps -a | grep postgres)" ] && npm run seed