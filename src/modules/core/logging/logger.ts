import { transports, format } from 'winston';
import { LogLevelEnum } from '@common/enums/logLevel.enum';
import { dataParserHelperMock } from '@dev/mocks/mockedModules';


export interface LoggerInterface {
	error: (...args: unknown[]) => void;
	warn: (...args: unknown[]) => void;
	info: (...args: unknown[]) => void;
	http: (...args: unknown[]) => void;
	verbose: (...args: unknown[]) => void;
	debug: (...args: unknown[]) => void;
}

export interface MetadataInterface {
	context?: string;
	requestId?: string;
	socketId?: string;
	ip?: string;
	details?: string | object | object[];
	stack?: unknown;
}

function getMessageFormatter() {
	const levelFormatter = (level: string): string => format.colorize().colorize(level, level.toUpperCase());
	const purpleConsoleColor = '\x1b[0;35m';
	const defaultConsoleColor = '\x1b[0m';
	const contextFormatter = (ctx: string): string => `${purpleConsoleColor}${ctx}${defaultConsoleColor}`;

	return format.printf((info) => {
		const {
			level,
			message,
			timestamp,
			stack: errorStack,
			context: ctx,
			meta,
		} = info;
		const metadata = meta as Record<string, unknown>;
		const context = (ctx ?? metadata?.context) as string | undefined;

		const logLevel = levelFormatter(level);
		const logContext = contextFormatter(context ?? 'DefaultContext');
		const requestId = metadata?.requestId;
		const socketId = metadata?.socketId;
		const ip = metadata?.ip;
		const logStack = errorStack ?? metadata?.stack;

		let log = `${dataParserHelperMock.toString(message)}`;

		if (ip) log += ` - IP: ${dataParserHelperMock.toString(ip)}`;
		if (requestId) log += ` - requestId: ${dataParserHelperMock.toString(requestId)}`;
		if (socketId) log += ` - socketId: ${dataParserHelperMock.toString(socketId)}`;

		if (logStack) {
			if (Array.isArray(logStack))
				logStack.forEach((stack) => {
					log += `\n${stack}`;
				});
			else log += `\n${dataParserHelperMock.toString(logStack)}`;
		}

		return `${dataParserHelperMock.toString(timestamp)} | ${logLevel} [${logContext}]: ${log}`;
	});
}

export function getLoggerOptions(serviceName: string, environment: string, context: string | undefined, logsPath: string, showDetailedLogs: boolean) {
	const messageFormatter = getMessageFormatter();
	const defaultFormat = format.combine(
		format.timestamp(),
		format.errors({ stack: showDetailedLogs }),
		messageFormatter,
	);

	const consoleMaxLevel = showDetailedLogs === true ? LogLevelEnum.DEBUG : LogLevelEnum.HTTP;
	const fileMaxLevel = showDetailedLogs === true ? LogLevelEnum.HTTP : LogLevelEnum.WARN;
	return {
		format: format.combine(defaultFormat, format.json()),
		defaultMeta: {
			context,
			service: serviceName,
			env: environment,
		},
		transports: [
			new transports.Console({
				level: consoleMaxLevel,
				format: defaultFormat,
			}),
			new transports.File({
				level: fileMaxLevel,
				filename: logsPath,
			}),
		],
		exitOnError: false,
	};
}
