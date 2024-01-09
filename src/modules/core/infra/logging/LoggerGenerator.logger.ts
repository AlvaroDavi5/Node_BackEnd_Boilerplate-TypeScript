import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { createLogger, transports, format, Logger } from 'winston';
import { ConfigService } from '@nestjs/config';
import { ConfigsInterface } from '@core/configs/configs.config';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import { wrapperType } from 'src/types/constructorType';


@Injectable()
export default class LoggerGenerator {
	private readonly logger: Logger;

	constructor(
		private readonly configService: ConfigService,
		@Inject(forwardRef(() => DataParserHelper)) // ? resolve circular dependency
		private readonly dataParserHelper: wrapperType<DataParserHelper>, // * wrapperType to transpile in SWC
	) {
		this.logger = createLogger(this.loggerOptions);
	}

	private readonly applicationConfigs: ConfigsInterface['application'] = this.configService.get<any>('application');

	private readonly defaultMessageFormatter = format.printf((msg) => {
		const { level, timestamp, message, stack } = msg;
		let log = typeof message === 'object'
			? this.dataParserHelper.toString(msg.message)
			: message;

		if (stack) {
			log = stack;
		}

		return `${timestamp} | ${level}: ${log}`;
	});

	private readonly defaultFormat = format.combine(
		format.timestamp(),
		format.errors({ stack: this.applicationConfigs.stackErrorVisible === 'true' }),
		this.defaultMessageFormatter,
	);

	private readonly loggerOptions = {
		format: format.combine(
			this.defaultFormat,
			format.json(),
		),
		defaultMeta: {
			service: this.applicationConfigs.name,
			env: this.applicationConfigs.environment,
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
				filename: this.applicationConfigs.logsPath
			}),
		],
		exitOnError: false,
	};

	public getLogger(recreate = false): Logger {
		if (recreate)
			return createLogger(this.loggerOptions);
		return this.logger;
	}
}
