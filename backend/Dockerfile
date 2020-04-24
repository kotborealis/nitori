FROM node:13-alpine

RUN mkdir -p /app
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
ENTRYPOINT ["node", "/app/src/index.js"]