# Build react app
FROM node:14-alpine3.13 as build

RUN apk add --no-cache bash
RUN npm install -g npm@latest

RUN mkdir /home/node/csx
WORKDIR /home/node/csx

COPY ./app/ .