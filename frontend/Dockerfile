FROM node:alpine AS build

RUN apk update && apk add autoconf automake

RUN mkdir -p /app
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ----

FROM nginx:alpine
COPY --from=build /app/build/ /usr/share/nginx/html/
