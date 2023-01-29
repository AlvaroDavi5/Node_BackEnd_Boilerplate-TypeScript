
FROM node:alpine as build
LABEL Description="Docker Image for NodeJS"
#MAINTAINER Alvaro alvaro.davsa@gmail.com
LABEL org.opencontainers.image.authors="alvaro.davsa@gmail.com"
ENV Version="1.0.0"

ENV NODE_PATH=.
ENV NODE_ENV=${NODE_ENV}
ENV APP_PORT=3000

WORKDIR /app
USER root

#COPY --from=build /app /app
COPY ./ ./
RUN yarn install
RUN chmod +x init.sh
CMD [ "./init.sh" ]

#ENTRYPOINT ["/usr/bin/node", "-D", "FOREGROUND"]
EXPOSE 3000
