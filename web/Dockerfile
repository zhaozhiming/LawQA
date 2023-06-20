FROM node:18.14.2-alpine as web-build-images

WORKDIR /opt/node_app

COPY . .

RUN npm install && npm run build

FROM nginx:1.23-alpine 

WORKDIR /usr/src/app/

COPY --from=web-build-images /opt/node_app/build /usr/share/nginx/html/