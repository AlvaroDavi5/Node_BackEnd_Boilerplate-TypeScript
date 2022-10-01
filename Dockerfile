
FROM node:alpine
LABEL Description="Docker Image for NodeJS"
#MAINTAINER Alvaro alvaro.davsa@gmail.com
LABEL org.opencontainers.image.authors="alvaro.davsa@gmail.com"
ENV Version="1.0.0"

WORKDIR /home/node/MyWorkspace
USER root

COPY package*.json *.lock ./
RUN yarn install
COPY ./ ./
CMD [ "npm", "run", "dev" ]

#VOLUME [ "/home/node/MyWorkspace" ]
EXPOSE 8080
#ENTRYPOINT ["/usr/bin/node", "-D", "FOREGROUND"]
