import { transports, format } from 'winston';


export enum LogLevelEnum {
	ERROR = 'error',
	WARN = 'warn',
	INFO = 'info',
	HTTP = 'http',
	VERBOSE = 'verbose',
	DEBUG = 'debug',
}

export interface LoggerInterface {
	error: (...args: any) => void;
	warn: (...args: any) => void;
	info: (...args: any) => void;
	http: (...args: any) => void;
	verbose: (...args: any) => void;
	debug: (...args: any) => void;
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
			context: context,
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
