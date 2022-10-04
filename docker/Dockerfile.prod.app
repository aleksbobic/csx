# Build react app
FROM node:14-alpine3.13 as build

RUN apk update && apk upgrade && apk add git

RUN apk add --no-cache bash
RUN npm install -g npm@latest

RUN mkdir /home/node/csx
WORKDIR /home/node/csx

COPY ./app/ .

RUN npm install --silent
# RUN npm install express
RUN npm run build

# Start an nginx server
FROM nginx:1.23.1-alpine
COPY --from=build /home/node/csx/build /usr/share/nginx/html
COPY ./nginx/nginx.prod.conf /etc/nginx/nginx.conf
RUN apk update && apk add --no-cache bash

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]