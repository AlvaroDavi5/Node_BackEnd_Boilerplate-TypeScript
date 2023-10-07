
export enum ProcessEventsEnum {
	UNCAUGHT_EXCEPTION = 'uncaughtException',
	UNHANDLED_REJECTION = 'unhandledRejection',
	MULTIPLE_RESOLVES = 'multipleResolves',
	ERROR = 'error',
	PROCESSING_ERROR = 'processing_error',
}

export enum ProcessSignalsEnum {
	SIGINT = 'SIGINT',
	SIGQUIT = 'SIGQUIT',
	SIGTERM = 'SIGTERM',
}

export enum ProcessExitStatusEnum {
	SUCCESS = 0,
	FAILURE = 1,
}
