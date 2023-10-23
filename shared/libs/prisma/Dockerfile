FROM node:18-alpine

RUN echo $DATABASE_URL

WORKDIR /app

COPY ./package.json ./
COPY . .

RUN chmod +x ./wait-for-postgres.sh

RUN yarn install
RUN npx prisma generate

RUN apt --assume-yes install postgresql-client

# Git will replace the LF line-endings with CRLF, causing issues while executing the wait-for-postgres shell script
# Install dos2unix and replace CRLF (\r\n) newlines with LF (\n)
RUN apt --assume-yes install dos2unix
RUN dos2unix wait-for-postgres.sh

CMD sh ./wait-for-postgres.sh ${DB_HOST} ${POSTGRES_USER} npx prisma migrate deploy
