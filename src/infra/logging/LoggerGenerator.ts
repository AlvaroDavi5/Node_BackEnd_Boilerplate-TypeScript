import { createLogger, transports, format, Logger } from 'winston';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigsInterface } from '@configs/configs';


@Injectable()
export default class LoggerGenerator {
	constructor(
		private readonly configService: ConfigService,
	) { }

	private readonly applicationConfigs: ConfigsInterface['application'] = this.configService.get<any>('application');

	private readonly defaultMessageFormatter = format.printf(msg => {
		const { level, timestamp, message, stack } = msg;
		let log = typeof message === 'object'
			? JSON.stringify(msg.message)
			: message;

		if (stack) {
			log = stack;
		}

		return `${timestamp} | ${level}: ${log}`;
	});

	private readonly defaultFormat = format.combine(
		format.timestamp(),
		format.errors({ stack: this.applicationConfigs?.stackErrorVisible || false }),
		this.defaultMessageFormatter,
	);

	private readonly loggerOptions = {
		format: format.combine(
			this.defaultFormat,
			format.json(),
		),
		defaultMeta: {
			service: this.applicationConfigs?.name || 'Node Boilerplate',
			env: this.applicationConfigs?.environment || 'dev',
		},
		transports: [
			new transports.Console({
				level: 'debug', // error,warn,info,debug
				format: format.combine(
					format.colorize(),
					this.defaultFormat,
				),
			}),
			new transports.File({
				level: 'info',
				filename: this.applicationConfigs?.logsPath || './logs/logs.log'
			}),
		],
		exitOnError: false,
	};

	public getLogger(): Logger {
		return createLogger(this.loggerOptions);
	}
}
