#!/bin/sh

COMMAND='start'; # default script command
NODE_ENV=${NODE_ENV:-'dev'}; # default env
SOCKET_ENV=${SOCKET_ENV:-'enabled'};

if [ $NODE_ENV != 'prod' ];
then
	if [ $NODE_ENV = 'hml' ]; then
		SHOW_ERROR_STACK='true'; # show application errors stack
	elif [ $NODE_ENV = 'dev' ]; then
		SHOW_LOGS='true'; # show third-party and backing services logs
	fi
	COMMAND='dev';
fi;

yarn run $COMMAND;
