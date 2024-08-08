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
	stack?: unknown | unknown[],
}

function getMessageFormatter() {
	return format.printf((info) => {
		const { level: logLevel, message, timestamp, stack: errorStack, context, meta } = info;
		const level = format.colorize().colorize(logLevel, logLevel.toUpperCase());
		const logContext = (context || meta?.context) ?? 'DefaultContext';
		const requestId = meta?.requestId;
		const logStack = errorStack ?? meta?.stack;

		let log = `${dataParserHelperMock.toString(message)}`;

		if (requestId)
			log += ` - requestId: ${requestId}`;
		if (logStack) {
			if (Array.isArray(logStack))
				logStack.forEach((stack) => {
					log += `\n${stack}`;
				});
			else
				log += `\n${logStack}`;
		}

		return `${timestamp} | ${level} [${logContext}]: ${log}`;
	});
}

export function getLoggerOptions(serviceName: string, environment: string, context: string, logsPath: string, showErrorStack: boolean) {
	const messageFormatter = getMessageFormatter();
	const defaultFormat = format.combine(
		format.timestamp(),
		format.errors({ stack: showErrorStack }),
		messageFormatter,
	);

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
				level: LogLevelEnum.DEBUG, // error ← debug
				format: defaultFormat,
			}),
			new transports.File({
				level: LogLevelEnum.INFO,
				filename: logsPath,
			}),
		],
		exitOnError: false,
	};
}

export function generateLogger(loggerContext: string): Logger {
	const loggerOptions = getLoggerOptions(
		(process.env.APP_NAME ?? 'Node Boilerplate'),
		(process.env.NODE_ENV ?? 'dev'),
		loggerContext,
		(process.env.APP_LOGS_PATH ?? './logs/logs.log'),
		(process.env.SHOW_ERROR_STACK ?? 'true') === 'true',
	);

	return createLogger(loggerOptions);
}
