
FROM node:24.2.0-slim AS build

LABEL name="Node Back-End Boilerplate Image"
LABEL description="Docker Image for Node.js Back-End Boilerplate"
LABEL maintainer="Alvaro <alvaro.davsa@gmail.com>"
#MAINTAINER Alvaro alvaro.davsa@gmail.com
LABEL org.opencontainers.image.authors="alvaro.davsa@gmail.com"
LABEL tag="boilerplate-image"
LABEL version="1.0"

ENV buildTag="1.0"

USER root
WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm ci --ignore-scripts

COPY tsconfig* ./
COPY .swcrc ./
COPY webpack.config.ts ./
COPY nest-cli.json ./
COPY src ./src
COPY init.sh ./

RUN mkdir -p docs temp
RUN chmod +x init.sh
RUN npm run build

FROM node:24.2.0-slim AS prod

ENV CI="true"
ENV NODE_ENV="prod"

RUN groupadd -r appgroup && useradd -r -g appgroup -d /app -s /sbin/nologin appuser
RUN mkdir -p /app && chown -R appuser:appgroup /app

USER appuser
WORKDIR /app

COPY --from=build --chown=appuser:appgroup /app/build ./build
COPY --from=build --chown=appuser:appgroup /app/package.json ./package.json
COPY --from=build --chown=appuser:appgroup /app/package-lock.json ./package-lock.json
COPY --from=build --chown=appuser:appgroup /app/init.sh ./init.sh

RUN npm install --ignore-scripts --omit=dev

EXPOSE 3000

CMD [ "./init.sh" ]

#ENTRYPOINT ["/usr/bin/node", "-D", "FOREGROUND"]
#VOLUME [ "/app" ]
