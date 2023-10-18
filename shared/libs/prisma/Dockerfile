# add the Node.js docker image
FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY package*.json ./
COPY schema.prisma schema.prisma
RUN npm install
CMD npm run migrate dev --name init