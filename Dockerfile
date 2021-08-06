FROM ubuntu:20.04

COPY ./ root/docker-nodejsserver

RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt install -y curl
RUN apt install -y wget
RUN apt install -y vim
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash

ENV NODE_VERSION=14.17.3
ENV NVM_DIR=/root/.nvm
RUN . "${NVM_DIR}/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "${NVM_DIR}/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "${NVM_DIR}/nvm.sh" && nvm alias default v${NODE_VERSION}

ENV NODE_PATH ${NVM_DIR}/versions/node/v${NODE_VERSION}/lib/node_modules
ENV PATH ${NVM_DIR}/versions/node/v${NODE_VERSION}/bin:${PATH}

WORKDIR /root/docker-nodejsserver/nodejsserver
RUN npm install

EXPOSE 8080 8081
ENTRYPOINT ["npm", "run", "startserver"]