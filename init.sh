#!/bin/bash


# STDERR log function
err() {
	echo -e "\n[$(date +'%Y-%m-%dT%H:%M:%S%z')]: $@\n" >&2
	exit 1
}

# STDOUT log function
log() {
	echo -e "\n[$(date +'%Y-%m-%dT%H:%M:%S%z')]: $@\n"
}

log "Copying Dotenv file..."
cp envs/.env.development.local ./.env && source ./.env
if [ $? -ne 0 ]; then
	err "Error while copying '.env' file."
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

yarn run $COMMAND;
