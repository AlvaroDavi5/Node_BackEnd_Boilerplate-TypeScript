
export enum ProcessEventsEnum {
	// ! app events
	UNCAUGHT_EXCEPTION = 'uncaughtException',
	UNHANDLED_REJECTION = 'unhandledRejection',
	MULTIPLE_RESOLVES = 'multipleResolves',
	// * queues errors
	ERROR = 'error',
	PROCESSING_ERROR = 'processing_error',
	TIMEOUT_ERROR = 'timeout_error',
}

export enum ProcessSignalsEnum {
	// ? terminal signals
	SIGINT = 'SIGINT',
	SIGQUIT = 'SIGQUIT',
	SIGABRT = 'SIGABRT',
	SIGTERM = 'SIGTERM',
	SIGKILL = 'SIGKILL',
}

export enum ProcessExitStatusEnum {
	SUCCESS = 0,
	FAILURE = 1,
}
