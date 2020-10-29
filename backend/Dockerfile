FROM node:14-alpine

RUN mkdir -p /app
WORKDIR /app

COPY ./backend/package*.json /app/backend/
RUN cd /app/backend && npm ci
COPY ./backend/ /app/backend/
COPY ./sandbox /app/sandbox
WORKDIR /app/backend/
ENTRYPOINT ["node", "/app/backend/src/index.js"]
