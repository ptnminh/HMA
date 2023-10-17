FROM node:18-alpine
RUN mkdir -p /var/www/auth
WORKDIR /var/www/auth
ADD . /var/www/auth
RUN npm install
CMD npm run build && npm run start:prod
