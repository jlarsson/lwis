FROM ubuntu
MAINTAINER Joakim Larsson

# install our dependencies and nodejs
RUN echo "deb http://archive.ubuntu.com/ubuntu precise main universe" > /etc/apt/sources.list
RUN apt-get update
RUN apt-get -y install curl git

RUN curl -sL https://deb.nodesource.com/setup | bash -
RUN apt-get update
RUN apt-get -y install nodejs
RUN npm install -g grunt-cli bower

RUN apt-get install -y graphicsmagick

ADD package.json /tmp/package.json
ADD bower.json /tmp/bower.json

RUN cd /tmp && npm install
RUN cd /tmp && bower install --allow-root --silent
RUN mkdir -p /opt/app
RUN cp -a /tmp/node_modules /opt/app/
RUN cp -a /tmp/bower_components /opt/app/
RUN cp -a /tmp/package.json /opt/app/package.json
RUN cp -a /tmp/bower.json /opt/app/bower.json
ADD public /opt/app/public/
ADD Gruntfile.js /opt/app/Gruntfile.js
#RUN chmod -R 777 /opt/app/
RUN cd /opt/app && grunt

WORKDIR /opt/app
ADD app.js /opt/app/app.js
ADD server.js /opt/app/server.js
ADD config /opt/app/config/
ADD modules /opt/app/modules/
ADD views /opt/app/views/

EXPOSE 3000

CMD ["node","server.js"]
