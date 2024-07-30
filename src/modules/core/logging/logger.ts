import { createLogger, transports, format, Logger } from 'winston';
import { dataParserHelperMock } from '@dev/mocks/mockedModules';


export enum LogLevelEnum {
	ERROR = 'error',
	WARN = 'warn',
	INFO = 'info',
	HTTP = 'http',
	VERBOSE = 'verbose',
	DEBUG = 'debug',
}

export interface LoggerInterface {
	error: (...args: unknown[]) => void;
	warn: (...args: unknown[]) => void;
	info: (...args: unknown[]) => void;
	http: (...args: unknown[]) => void;
	verbose: (...args: unknown[]) => void;
	debug: (...args: unknown[]) => void;
}

export interface MetadataInterface {
	context?: string,
	requestId?: string,
	details?: string | object | object[],
	stack?: string | string[] | object[],
}

export function getMessageFormatter(parser: (data: unknown) => string) {
	return format.printf((info) => {
		const { level, message, timestamp, stack, context, meta } = info;
		const logContext = (context || meta?.context) ?? 'DefaultContext';
		const requestId = meta?.requestId;
		const logStack = stack ?? meta?.stack;

		let log = `${parser(message)}`;

		if (requestId)
			log += ` - requestId: ${requestId}`;
		if (logStack)
			log += `\n${logStack}`;

		return `${timestamp} | ${level} [${logContext}]: ${log}`;
	});
}

export function getDefaultFormat(stackErrorVisible: boolean, defaultMessageFormatter: any) {
	return format.combine(
		format.timestamp(),
		format.errors({ stack: stackErrorVisible }),
		defaultMessageFormatter,
	);
}

export function getLoggerOptions(serviceName: string, environment: string, context: string, logsPath: string, defaultFormat: any) {
	return {
		format: format.combine(
			defaultFormat,
			format.json(),
		),
		defaultMeta: {
			context,
			service: serviceName,
			env: environment,
		},
		transports: [
			new transports.Console({
				level: 'debug', // error,warn,info,debug
				format: format.combine(
					format.colorize(),
					defaultFormat,
				),
			}),
			new transports.File({
				level: 'info',
				filename: logsPath,
			}),
		],
		exitOnError: false,
	};
}

export function generateLogger(loggerContext: string): Logger {

	const messageFormatter = format.printf((info) => {
		const { level, message, timestamp, stack, context, meta } = info;
		const logContext = (context || meta?.context) ?? 'DefaultContext';
		const requestId = meta?.requestId;
		const logStack = stack ?? meta?.stack;

		let log = `${dataParserHelperMock.toString(message)}`;

		if (requestId)
			log += ` - requestId: ${requestId}`;
		if (logStack)
			log += `\n${logStack}`;

		return `${timestamp} | ${level} [${logContext}]: ${log}`;
	});

	const defaultFormat = getDefaultFormat(
		(process.env.SHOW_ERROR_STACK ?? 'true') === 'true',
		messageFormatter,
	);

	const loggerOptions = getLoggerOptions(
		(process.env.APP_NAME ?? 'Node Boilerplate'),
		(process.env.NODE_ENV ?? 'dev'),
		loggerContext,
		(process.env.APP_LOGS_PATH ?? './logs/logs.log'),
		defaultFormat,
	);

	return createLogger(loggerOptions);
}
