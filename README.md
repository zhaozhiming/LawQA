# LawQA

A question answering system for law in Chinese.

![demo](./demo.png)

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
CHATGPT_APIKEY=XXXX docker-compose up -d
```