
FROM node:alpine as build
LABEL Description="Docker Image for NodeJS"
#MAINTAINER Alvaro alvaro.davsa@gmail.com
LABEL org.opencontainers.image.authors="alvaro.davsa@gmail.com"
ENV Version="1.0.0"

ENV IS_ON_DOCKER="TRUE"
ENV NODE_PATH=.
ENV NODE_ENV=${NODE_ENV:-"prod"}
ENV APP_PORT=3000

USER root
WORKDIR /app

#COPY --from=build /app /app
COPY ./package.json ./package.json
COPY ./yarn.lock ./yarn.lock
COPY ./tsconfig.json ./tsconfig.json
COPY ./tsconfig.spec.json ./tsconfig.spec.json
COPY ./src ./src
COPY ./nest-cli.json ./nest-cli.json
COPY ./webpack.config.js ./webpack.config.js
COPY ./nodemon.json ./nodemon.json
COPY ./nodemon-debug.json ./nodemon-debug.json
COPY ./init.sh ./init.sh

RUN chmod +x init.sh
RUN yarn install
CMD [ "./init.sh" ]

#ENTRYPOINT ["/usr/bin/node", "-D", "FOREGROUND"]
#VOLUME [ "/app" ]
EXPOSE 3000
