import { INQUIRER } from '@nestjs/core';
import { Injectable, Inject, Provider, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createLogger, Logger } from 'winston';
import { ConfigsInterface } from '@core/configs/envs.config';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import {
	LoggerInterface, LogLevelEnum, MetadataInterface,
	getLoggerOptions, getDefaultFormat, getMessageFormatter
} from './logger';
import { dataParserHelperMock } from '@dev/mocks/mockedModules';


@Injectable({ scope: Scope.TRANSIENT })
export default class LoggerService implements LoggerInterface {
	private contextName!: string;
	private requestId?: string;
	private readonly logger: Logger;

	constructor(
		@Inject(INQUIRER) // ? get inquirer class
		private readonly inquirer: string | object,
		private readonly configService: ConfigService,
		// @Inject(forwardRef(() => DataParserHelper)) // ? resolve circular dependency
		// private readonly dataParserHelper: wrapperType<DataParserHelper>,
		private readonly dataParserHelper: DataParserHelper,
	) {
		const applicationConfigs = this.configService.get<ConfigsInterface['application']>('application')!;

		const messageFormatter = getMessageFormatter(this.dataParserHelper.toString);

		const defaultFormat = getDefaultFormat(
			applicationConfigs.stackErrorVisible,
			messageFormatter,
		);

		const loggerOptions = getLoggerOptions(
			applicationConfigs.name,
			applicationConfigs.environment,
			undefined as any,
			applicationConfigs.logsPath,
			defaultFormat,
		);

		this.logger = createLogger(loggerOptions);
	}

	public getContextName(): string {
		return this.contextName;
	}

	public setContextName(contextName: string): void {
		this.contextName = contextName;
	}

	public getRequestId(): string | undefined {
		return this.requestId;
	}

	public setRequestId(requestId: string | undefined): void {
		this.requestId = requestId;
	}

	private buildLog(args: unknown[]): { message: string, meta: MetadataInterface } {
		const inquirerName = typeof this.inquirer === 'string'
			? this.inquirer
			: this.inquirer?.constructor?.name;
		const contextName = this.getContextName() ?? inquirerName;
		this.setContextName(contextName);

		let message = '';
		const metadata: MetadataInterface = {
			context: this.getContextName(),
			requestId: this.getRequestId(),
		};

		const separator = args.length > 1 ? ' ' : '';
		args.forEach((arg: unknown) => {
			if (arg instanceof Error) {
				const errorName = arg.name.length > 0 ? `\x1b[0;30m${arg.name}\x1b[0m - ` : '';
				message += `${errorName}${arg.message}${separator}`;
				if (arg.stack)
					metadata.stack = arg.stack;
			} else if (typeof arg === 'string')
				message += `${arg}${separator}`;
			else
				message += `${this.dataParserHelper.toString(arg)}${separator}`;
		});

		return {
			message,
			meta: metadata,
		};
	}

	[LogLevelEnum.ERROR](...args: unknown[]): void {
		const { message, meta } = this.buildLog(args);

		this.logger.log({
			level: LogLevelEnum.ERROR,
			message,
			meta,
		});
	}

	[LogLevelEnum.WARN](...args: unknown[]): void {
		const { message, meta } = this.buildLog(args);

		this.logger.log({
			level: LogLevelEnum.WARN,
			message,
			meta,
		});
	}

	[LogLevelEnum.INFO](...args: unknown[]): void {
		const { message, meta } = this.buildLog(args);

		this.logger.log({
			level: LogLevelEnum.INFO,
			message,
			meta,
		});
	}

	[LogLevelEnum.HTTP](...args: unknown[]): void {
		const { message, meta } = this.buildLog(args);

		this.logger.log({
			level: LogLevelEnum.HTTP,
			message,
			meta,
		});
	}

	[LogLevelEnum.VERBOSE](...args: unknown[]): void {
		const { message, meta } = this.buildLog(args);

		this.logger.log({
			level: LogLevelEnum.VERBOSE,
			message,
			meta,
		});
	}

	[LogLevelEnum.DEBUG](...args: unknown[]): void {
		const { message, meta } = this.buildLog(args);

		this.logger.log({
			level: LogLevelEnum.DEBUG,
			message,
			meta,
		});
	}
}

export const REQUEST_LOGGER_PROVIDER = Symbol('RequestLoggerProvider');
export const RequestLoggerProvider: Provider = {
	provide: REQUEST_LOGGER_PROVIDER,
	scope: Scope.REQUEST,

	inject: [
		INQUIRER,
		ConfigService,
	],
	useFactory: (
		inquirer: string | object,
		configService: ConfigService,
	): LoggerService => new LoggerService(inquirer, configService, dataParserHelperMock as DataParserHelper),

	durable: false,
};

export const SINGLETON_LOGGER_PROVIDER = Symbol('SingletonLoggerProvider');
export interface LoggerProviderInterface {
	getLogger: (context: string) => LoggerService,
}
export const SingletonLoggerProvider: Provider = {
	provide: SINGLETON_LOGGER_PROVIDER,
	scope: Scope.DEFAULT,

	inject: [
		ConfigService,
	],
	useFactory: (
		configService: ConfigService,
	): LoggerProviderInterface => ({
		getLogger: (context: string): LoggerService => new LoggerService(context, configService, dataParserHelperMock as DataParserHelper),
	}),

	durable: false,
};
