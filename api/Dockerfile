FROM node:18.14.2-alpine

WORKDIR /opt/node_app

COPY . .

RUN npm install && npm run build

CMD npm run start:prod