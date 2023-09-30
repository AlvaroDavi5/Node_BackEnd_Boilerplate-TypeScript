#!/bin/sh


default="\033[0m"
red="\033[0;31m"
green="\033[0;32m"

# STDERR log function
err() {
	echo -e "${red} \n[$(date +'%Y-%m-%dT%H:%M:%S%z')]: $@\n ${default}" >&2;
	exit 1;
}

# STDOUT log function
log() {
	echo -e "${green} \n[$(date +'%Y-%m-%dT%H:%M:%S%z')]: $@\n ${default}";
}

if [ ! -e .env -a "$IS_ON_DOCKER" != "TRUE" ]; then
	log "Copying Dotenv File...";
	cp envs/.env.development.local .env > /dev/null 2>&1;
	if [ $? -ne 0 ]; then
		err "Error while copying '.env' file.";
	fi
	source .env;
fi

COMMAND='start:prod'; # default script command
NODE_ENV=${NODE_ENV:-'dev'}; # default env
SOCKET_ENV=${SOCKET_ENV:-'enabled'};
if [ $NODE_ENV != 'prod' ]; then
	if [ $NODE_ENV = 'hml' ]; then
		SHOW_ERROR_STACK='true'; # show application errors stack
	elif [ $NODE_ENV = 'dev' ]; then
		SHOW_LOGS='true'; # show third-party and backing services logs
	fi
	COMMAND='start:dev';
fi;

if command -v yarn &> /dev/null
then
	log "Starting Application...";
	yarn run $COMMAND;
	if [ $? -ne 0 ]; then
		err "Error starting application.";
	fi
fi
