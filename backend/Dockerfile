FROM node:14-alpine

RUN mkdir -p /app
WORKDIR /app

COPY ./backend/package*.json ./
RUN npm ci
COPY ./backend/ .
COPY ./sandbox /sandbox
ENTRYPOINT ["node", "/app/src/index.js"]