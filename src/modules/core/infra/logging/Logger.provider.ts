import { Provider, Scope } from '@nestjs/common';
import { createLogger, transports, format, Logger } from 'winston';
import { ConfigService } from '@nestjs/config';
import { ConfigsInterface } from '@core/configs/configs.config';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';


function getMessageFormatter(context: string, parser: (data: unknown) => string | null) {
	return format.printf((msg) => {
		const { level, timestamp, message, stack } = msg;
		let log = typeof message === 'object'
			? parser(msg.message)
			: message;

		if (stack) {
			log = stack;
		}

		return `${timestamp} | ${level} [${context}]: ${log}`;
	});
}

function getDefaultFormat(stackErrorVisible: boolean, defaultMessageFormatter: any) {
	return format.combine(
		format.timestamp(),
		format.errors({ stack: stackErrorVisible }),
		defaultMessageFormatter,
	);
}

function getLoggerOptions(serviceName: string, environment: string, logsPath: string, defaultFormat: any) {
	return {
		format: format.combine(
			defaultFormat,
			format.json(),
		),
		defaultMeta: {
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

type getLoggerType = (context: string) => Logger;
export interface LoggerProviderInterface {
	getLogger: getLoggerType,
}

export const LOGGER_PROVIDER = Symbol('LoggerProvider');

const LoggerProvider: Provider = {
	provide: LOGGER_PROVIDER,
	scope: Scope.DEFAULT,

	inject: [
		ConfigService,
		DataParserHelper,
	],
	useFactory: (
		configService: ConfigService,
		dataParserHelper: DataParserHelper,
		...args: any[]
	): LoggerProviderInterface => {
		const applicationConfigs = configService.get<ConfigsInterface['application']>('application')!;

		return {
			getLogger: (context: string): Logger => {
				const messageFormatter = getMessageFormatter(
					context,
					dataParserHelper.toString,
				);

				const defaultFormat = getDefaultFormat(
					applicationConfigs.stackErrorVisible === 'true',
					messageFormatter,
				);

				const loggerOptions = getLoggerOptions(
					applicationConfigs.name,
					applicationConfigs.environment,
					applicationConfigs.logsPath,
					defaultFormat,
				);

				return createLogger(loggerOptions);
			}
		};
	},

	durable: false,
};

export default LoggerProvider;

export function generateLogger(context: string): Logger {
	const messageFormatter = getMessageFormatter(
		context,
		(data: any) => {
			try {
				return JSON.stringify(data) ?? '';
			} catch (error) {
				return data?.toString() ?? '';
			}
		},
	);

	const defaultFormat = getDefaultFormat(
		(process.env.SHOW_ERROR_STACK ?? 'true') === 'true',
		messageFormatter,
	);

	const loggerOptions = getLoggerOptions(
		(process.env.APP_NAME ?? 'Node Boilerplate'),
		(process.env.NODE_ENV ?? 'dev'),
		(process.env.APP_LOGS_PATH ?? './logs/logs.log'),
		defaultFormat,
	);

	return createLogger(loggerOptions);
}
