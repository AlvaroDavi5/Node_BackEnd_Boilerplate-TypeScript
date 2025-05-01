
FROM node:alpine AS build
LABEL name="Node Back-End Boilerplate Image"
LABEL description="Docker Image for Node.js Back-End Boilerplate"
LABEL maintainer="Alvaro alvaro.davsa@gmail.com"
#MAINTAINER Alvaro alvaro.davsa@gmail.com
LABEL org.opencontainers.image.authors="alvaro.davsa@gmail.com"
LABEL tag="boilerplate-image"
LABEL version="1.0"

ENV buildTag="1.0"
ENV IS_ON_CONTAINER="TRUE"
ENV NODE_PATH=.
ENV NODE_ENV="prod"
ENV APP_PORT=3000

USER root
WORKDIR /app

#COPY --from=build /app /app
COPY package.json ./package.json
COPY package-lock.json ./package-lock.json
COPY tsconfig* ./
COPY nodemon* ./
COPY webpack.config.js ./webpack.config.js
COPY babel.config.js ./babel.config.js
COPY .swcrc ./.swcrc
COPY nest-cli.json ./nest-cli.json
COPY src ./src
COPY tests ./tests
COPY scripts ./scripts
COPY jest* ./
COPY init.sh ./init.sh

RUN npm install
RUN npm run build
RUN chmod +x init.sh
CMD [ "./init.sh" ]

#ENTRYPOINT ["/usr/bin/node", "-D", "FOREGROUND"]
#VOLUME [ "/app" ]
EXPOSE 3000
