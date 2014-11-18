FROM ubuntu
MAINTAINER Joakim Larsson

# install some dependencies and update host
RUN echo "deb http://archive.ubuntu.com/ubuntu precise main universe" > /etc/apt/sources.list
RUN apt-get update && apt-get -y install \
  curl \
  git \
  graphicsmagick

# install latest nodejs and npm
RUN curl -sL https://deb.nodesource.com/setup | bash -
RUN apt-get update && apt-get -y install nodejs
RUN npm install -g \
  bower \
  grunt-cli

# Install npm and bower dependencies
# If package files ar unchanged, docker might cache the following steps
COPY package.json /tmp/package.json
COPY bower.json /tmp/bower.json
# bower must be muted due to (irrelevant) warnings
RUN cd /tmp && npm install && bower install --allow-root --silent

# Setup application folder
RUN mkdir -p /opt/app
RUN cp -a /tmp/node_modules /opt/app/ \
  && cp -a /tmp/bower_components /opt/app/ \
  && cp -a /tmp/package.json /opt/app/package.json \
  && cp -a /tmp/bower.json /opt/app/bower.json

# Build application distribution (css, js etc)
COPY public /opt/app/public/
COPY Gruntfile.js /opt/app/Gruntfile.js
RUN cd /opt/app && grunt

# Copy application scripts
COPY app.js /opt/app/app.js
COPY server.js /opt/app/server.js
COPY config /opt/app/config/
COPY modules /opt/app/modules/
COPY views /opt/app/views/

WORKDIR /opt/app

EXPOSE 3000

CMD ["node","server.js"]
