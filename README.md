### HOW TO RUN
```
    ### Auth Service
    $ cd apps/auth
    $ npm install
    $ npm run start:dev
    $ npx prisma generate --schema=./src/prisma/schema.prisma

    ### API Gateway
    $ cd apps/gateway
    $ npm install
    $ npm run start:dev

    ### Migrate database
    $ cd shared/libs/prisma
    $ npm install
    $ npm run migrate


    ### Swagger
    http://localhost:2222/api/v1/swagger

    
    ### Chờ khoảng 5p để db start xong
    docker compose up -d 


```


### Run with docker

```
    - Trường hợp lần đàu tiên chạy
    $ cd shared/libs/prisma
    $ npm install
    $ sudo chmod +x build.dev.sh
    $ ./build.dev.sh
    $ docker compose up -d

    - Trường hợp lần chạy thứ 2
    $ ./build.dev.sh
    $ docker compose up -d

```
Lưu ý: Mỗi service sẽ có file .env riêng => tạo .env theo .evv.example
