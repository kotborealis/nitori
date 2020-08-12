FROM node:14-alpine AS build

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

COPY nginx/nginx.conf /etc/nginx/

COPY --from=build /app/build/ /usr/share/nginx/html/
