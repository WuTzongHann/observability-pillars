# syntax=docker/dockerfile:1

FROM node:14.17.3-alpine3.14
ENV NODE_ENV=production

WORKDIR /app

COPY ["./package*.json", "/app"]

RUN npm install --production

COPY [".", "/app"]

ENTRYPOINT [ "npm", "run", "startserver" ]