
FROM node:alpine
LABEL Description="Docker Image for NodeJS"
#MAINTAINER Alvaro alvaro.davsa@gmail.com
LABEL org.opencontainers.image.authors="alvaro.davsa@gmail.com"
ENV Version="1.0.0"

WORKDIR /home/app
USER root

COPY ./package.json ./yarn.lock ./.env ./src/ ./scripts/
RUN yarn install
CMD [ "yarn", "run", "dev" ]

#VOLUME [ "/home/app" ]
EXPOSE 3000
#ENTRYPOINT ["/usr/bin/node", "-D", "FOREGROUND"]
