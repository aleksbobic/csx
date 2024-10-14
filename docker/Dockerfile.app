# Build react app
FROM node:18-alpine3.19 AS build

RUN apk add --no-cache bash
RUN npm install -g npm@9.0.0

RUN mkdir /home/node/csx
WORKDIR /home/node/csx

COPY ./app/ .