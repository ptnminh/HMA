#!/usr/bin/env bash
echo "Script executed from: ${PWD}"

BASEDIR=$(dirname $0)
echo "Script location: ${BASEDIR}"

docker rm -f hma_db

[ ! "$(docker ps -a | grep postgres)" ] && docker run -d -p 5555:5432 --network=some-network -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=123 -e POSTGRES_DB=hma --name hma_db \
    -v ${PWD}/db:/var/lib/postgresql/data postgres

cd shared/libs/prisma 

sleep 60s

npm run deploy

npm run seed