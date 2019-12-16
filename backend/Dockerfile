FROM node:13-alpine

ARG AUTH_API
ENV AUTH_API=$AUTH_API

RUN mkdir -p /app
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
ENTRYPOINT ["node", "/app/src/index.js"]