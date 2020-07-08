FROM node:13-alpine AS build

ARG PUBLIC_PATH

RUN apk update && apk add autoconf automake

RUN mkdir -p /app
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY ./src/ ./src/
COPY ./webpack/ ./webpack/
COPY ./.babelrc ./.babelrc
RUN npm run build

# ----

FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY frontend.conf /etc/nginx/conf.d/

COPY --from=build /app/build/ /usr/share/nginx/html/
