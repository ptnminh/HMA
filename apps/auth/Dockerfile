FROM node:19-alpine AS builder

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY schema.prisma schema.prisma

# Install app dependencies
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

FROM node:19-alpine

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/schema.prisma schema.prisma

EXPOSE 8003

CMD [ "npm", "run", "prod" ]
