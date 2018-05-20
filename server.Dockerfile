FROM ubuntu:latest

RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y gnupg
RUN curl -sL https://deb.nodesource.com/setup_9.x | bash -
RUN apt-get install -y nodejs
RUN apt-get install -y vim

RUN mkdir -p /opt/top-down-arena-shooter
ADD server /opt/top-down-arena-shooter/server
ADD utils /opt/top-down-arena-shooter/utils
ADD LICENSE /opt/top-down-arena-shooter/
ADD README.md /opt/top-down-arena-shooter/
ADD package* /opt/top-down-arena-shooter/

WORKDIR /opt/top-down-arena-shooter
RUN npm install

EXPOSE 80

CMD ["/usr/bin/node", "/opt/top-down-arena-shooter/server/src/index.js"]
