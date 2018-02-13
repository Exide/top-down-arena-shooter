FROM ubuntu

RUN apt-get update
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_9.x | bash -
RUN apt-get install -y nodejs
RUN apt-get install -y nginx
RUN apt-get install -y vim

RUN mkdir -p /opt/top-down-arena-shooter
ADD server /opt/top-down-arena-shooter/server
ADD client /opt/top-down-arena-shooter/client
ADD utils /opt/top-down-arena-shooter/utils
ADD LICENSE /opt/top-down-arena-shooter/
ADD README.md /opt/top-down-arena-shooter/
ADD package* /opt/top-down-arena-shooter/

WORKDIR /opt/top-down-arena-shooter
RUN npm install
RUN npm run build-client
RUN rm /etc/nginx/sites-available/default
RUN ln -s /opt/top-down-arena-shooter/client/nginx.config /etc/nginx/sites-available/default
RUN nginx -t
RUN service nginx start

EXPOSE 8080
EXPOSE 8081

CMD ["/usr/bin/node", "/opt/top-down-arena-shooter/server/src/index.js"]
