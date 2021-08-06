FROM ubuntu:20.04
MAINTAINER richard

RUN cd ~/
COPY . ~/

RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt install -y curl
RUN apt install -y wget
RUN apt install -y vim
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
# RUN echo "export NVM_DIR=\"\$HOME/.nvm\"" >> ~/.bashrc
# RUN echo "[ -s \"\$NVM_DIR/nvm.sh\" ] && \\. \"\$NVM_DIR/nvm.sh\"  # This loads nvm" >> ~/.bashrc
# RUN echo "[ -s \"\$NVM_DIR/bash_completion\" ] && \\. \"\$NVM_DIR/bash_completion\"  # This loads nvm bash_completion" >> ~/.bashrc
# RUN exit
# RUN nvm install 14.17.3
ENV NODE_VERSION=14.17.3
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}

CMD cd ~/nodejsserver
CMD npm install
CMD npm run startserver