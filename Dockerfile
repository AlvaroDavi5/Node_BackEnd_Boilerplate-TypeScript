
FROM node:alpine as build
LABEL Description="Docker Image for NodeJS"
#MAINTAINER Alvaro alvaro.davsa@gmail.com
LABEL org.opencontainers.image.authors="alvaro.davsa@gmail.com"
ENV Version="1.0.0"

ENV NODE_PATH=.
ENV NODE_ENV=${NODE_ENV:-"prod"}
ENV APP_PORT=3000

USER root
WORKDIR /app

#COPY --from=build /app /app
COPY ./configs ./configs
COPY ./src ./src
COPY ./tsconfig.json ./tsconfig.json
COPY ./package.json ./package.json
COPY ./yarn.lock ./yarn.lock
COPY ./init.sh ./init.sh

RUN yarn install
RUN chmod +x init.sh
CMD [ "./init.sh" ]

#ENTRYPOINT ["/usr/bin/node", "-D", "FOREGROUND"]
#VOLUME [ "/app" ]
EXPOSE 3000
