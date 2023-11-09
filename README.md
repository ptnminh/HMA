### HOW TO RUN
```
    ### Auth Service
    $ cd apps/auth
    $ npm install
    $ npm run start:dev
    $ npx prisma generate

    ### API Gateway
    $ cd apps/gateway
    $ npm install
    $ npm run start:dev
```


### Run with docker

```
    $ docker compose up -d

```
Lưu ý: Mỗi service sẽ có file .env riêng => tạo .env theo .evv.example
