#!/bin/sh


default="\033[0m"
red="\033[0;31m"
green="\033[0;32m"

# STDERR log function
err() {
	echo "${red} \n[$(date +'%Y-%m-%dT%H:%M:%S%z')]: $@\n ${default}" >&2;
	exit 1;
}

# STDOUT log function
log() {
	echo "${green} \n[$(date +'%Y-%m-%dT%H:%M:%S%z')]: $@\n ${default}";
}

if [ ! -e .env -a "$IS_ON_CONTAINER" != "TRUE" ]; then
	log "Copying Dotenv File...";
	cp envs/.env.development.local .env > /dev/null 2>&1;
	if [ $? -ne 0 ]; then
		err "Error while copying '.env' file.";
	fi
	source .env;
fi

EXEC_COMMAND='start:prod'; # default script command
NODE_ENV=${NODE_ENV:-'dev'}; # default env
SOCKET_ENV=${SOCKET_ENV:-'enabled'};
if [ $NODE_ENV != 'prod' ]; then
	if [ $NODE_ENV = 'test' ]; then
		EXEC_COMMAND='start:webpack';
		SHOW_EXTERNAL_LOGS='true'; # show third-party and backing services logs
	elif [ $NODE_ENV = 'dev' ]; then
		EXEC_COMMAND='start:dev';
		SHOW_DETAILED_LOGS='true'; # show application errors stack
	fi
fi;

if command -v yarn &> /dev/null
then
	log "Starting Application...";
	mkdir -p docs;
	yarn run $EXEC_COMMAND;
	if [ $? -ne 0 ]; then
		err "Error starting application.";
	fi
fi
