# my-project

## Deploy

### web
```sh
docker build --no-cache -t web .
```

#### build

### api

#### build
```sh
docker build --no-cache -t api .
```

### docker-compose

```sh
MONGO_USER=XXX MONGO_PWD=XXX REDIS_HOST=XXX \
REDIS_PWD=XXX MONGO_HOST=XXX SALT=XXX IV=XXXX \
JWT_SECRET=XXXX CHATGPT_APIKEY=XXXX \
docker-compose up -d
```

### create user

```sh
docker exec -it api sh 
MONGO_USER=XXX MONGO_PWD=XXX MONGO_HOST=XXX SALT=XXX IV=XXXX node dist/scripts/create-user.js
```