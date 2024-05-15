import { Provider, Scope } from '@nestjs/common';
import { createLogger, format, Logger } from 'winston';
import {
	LoggerInterface,
	getLoggerOptions, getDefaultFormat,
} from './logger';
import { dataParserHelperMock } from '@dev/mocks/mockedModules';


export interface LoggerProviderInterface {
	getLogger: (context: string) => LoggerInterface,
}

export const LOGGER_PROVIDER = Symbol('LoggerProvider');

const LoggerProvider: Provider = {
	provide: LOGGER_PROVIDER,
	scope: Scope.DEFAULT,

	inject: [],
	useFactory: (...args: any[]): LoggerProviderInterface => {

		return {
			getLogger: (context: string): LoggerInterface => {
				return generateLogger(context);
			}
		};
	},

	durable: false,
};

export default LoggerProvider;

export function generateLogger(context: string): Logger {

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
		context,
		(process.env.APP_LOGS_PATH ?? './logs/logs.log'),
		defaultFormat,
	);

	return createLogger(loggerOptions);
}
