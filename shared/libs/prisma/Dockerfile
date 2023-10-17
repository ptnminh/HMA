# add the Node.js docker image
FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY package*.json ./
COPY schema.prisma schema.prisma
RUN npm install
# Generate prisma client
RUN npx prisma migrate deploy
# Run and expose the server on port 3000
EXPOSE 9000
# A command to start the server
CMD npm start