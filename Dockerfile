# syntax=docker/dockerfile:1

FROM node:14.17.3-alpine3.14
ENV NODE_ENV=production

WORKDIR /nodejsserver

COPY ["./nodejsserver/package*.json", "."]

RUN npm install --production

COPY ["./nodejsserver", "."]

ENTRYPOINT [ "npm", "run", "startserver" ]