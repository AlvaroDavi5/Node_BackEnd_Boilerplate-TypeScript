#!/bin/sh

COMMAND='start'; # default script command
NODE_ENV=${NODE_ENV:-'dev'}; # default env
SOCKET_ENV=${SOCKET_ENV:-'enabled'};

if [ $NODE_ENV != 'prod' ];
then
	if [ $NODE_ENV = 'hml' ]; then
		SHOW_ERROR_STACK='true'; # show errors stack
	fi
	COMMAND='dev';
fi;

yarn run $COMMAND;
