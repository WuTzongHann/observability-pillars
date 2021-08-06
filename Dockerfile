FROM ubuntu:20.04
MAINTAINER richard

COPY . /nodejsserver
RUN make /nodejsserver

RUN apt-get update
RUN apt-get upgrade
RUN apt install curl
RUN apt install wget
RUN apt install vim
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash

RUN nvm install 14.17.3

CMD cd /nodejsserver
CMD npm run startserver