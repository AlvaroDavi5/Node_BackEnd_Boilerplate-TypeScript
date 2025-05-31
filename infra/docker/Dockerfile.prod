
FROM node:20.19.2-slim AS build
LABEL name="Node Back-End Boilerplate Image"
LABEL description="Docker Image for Node.js Back-End Boilerplate"
LABEL maintainer="Alvaro <alvaro.davsa@gmail.com>"
#MAINTAINER Alvaro alvaro.davsa@gmail.com
LABEL org.opencontainers.image.authors="alvaro.davsa@gmail.com"
LABEL tag="boilerplate-image"
LABEL version="1.0"

ENV buildTag="1.0"
ENV CI="true"
ENV NODE_PATH=.

USER root
WORKDIR /app

#COPY --from=build /app ./app
COPY package.json ./
COPY package-lock.json ./
COPY scripts ./scripts

RUN npm ci --ignore-scripts

COPY tsconfig* ./
COPY webpack.config.js ./
COPY babel.config.js ./
COPY .swcrc ./
COPY nest-cli.json ./
COPY init.sh ./
COPY src ./src

RUN npm run build
RUN chmod +x init.sh
RUN chmod 644 ./src/modules/graphql/schemas/schema.gql

RUN groupadd -r appgroup && useradd -r -g appgroup -d /app -s /sbin/nologin appuser
RUN chown -R appuser:appgroup /app

USER appuser
WORKDIR /app

CMD [ "./init.sh" ]

#ENTRYPOINT ["/usr/bin/node", "-D", "FOREGROUND"]
#VOLUME [ "/app" ]
EXPOSE 3000
