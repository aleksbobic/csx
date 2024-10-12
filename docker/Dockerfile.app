# Build react app
FROM node:16-alpine3.18 as build

RUN apk add --no-cache bash
RUN npm install -g npm@8.3.0

RUN mkdir /home/node/csx
WORKDIR /home/node/csx

COPY ./app/ .