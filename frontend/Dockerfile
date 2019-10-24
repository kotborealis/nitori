FROM node:12-alpine AS build

ARG PUBLIC_PATH

RUN apk update && apk add autoconf automake

RUN mkdir -p /app
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ----

FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY frontend.conf /etc/nginx/conf.d/

COPY --from=build /app/build/ /usr/share/nginx/html/
