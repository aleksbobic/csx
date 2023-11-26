# Build react app
FROM node:16-alpine3.18 as build

RUN apk add --no-cache bash
RUN npm install -g npm@8.19.4
RUN npm install -g pnpm@8.10.5


RUN mkdir /home/node/csx
WORKDIR /home/node/csx

COPY ./app/ .