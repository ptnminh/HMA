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
    http://localhost:2000/api/v1/swagger

```