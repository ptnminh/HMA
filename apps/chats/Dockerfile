FROM node:16-alpine AS builder

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY schema.prisma schema.prisma

# Install app dependencies
RUN npm cache clean --force && \
    npm install -g npm@9.6.3 && \
    npm install

COPY . .

RUN npm run build

FROM node:16-alpine

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/schema.prisma schema.prisma

EXPOSE 8006

CMD [ "npm", "run", "prod" ]
