import { INQUIRER } from '@nestjs/core';
import { Injectable, Inject, Provider, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createLogger, Logger } from 'winston';
import { ConfigsInterface } from '@core/configs/envs.config';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import { LoggerInterface, LogLevelEnum, MetadataInterface, getLoggerOptions } from './logger';


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

		const loggerOptions = getLoggerOptions(
			applicationConfigs.name,
			applicationConfigs.environment,
			undefined as any,
			applicationConfigs.logsPath,
			applicationConfigs.showDetailedLogs,
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

		const metadata: MetadataInterface = {
			context: this.getContextName(),
			requestId: this.getRequestId(),
		};

		const errorStacks: string[] = [];
		args.forEach((arg: unknown) => {
			if (arg instanceof Error) {
				const blackConsoleColor = '\x1b[0;30m';
				const defaultConsoleColor = '\x1b[0m';

				if (arg.stack) {
					if (Array.isArray(arg.stack)) {
						const strStack: string[] = arg.stack.map((stack) => (`${blackConsoleColor}${stack}${defaultConsoleColor}`));
						errorStacks.push(...strStack);
					} else
						errorStacks.push(`${blackConsoleColor}${arg.stack}${defaultConsoleColor}`);
				}
			}
		});
		metadata.stack = errorStacks.length > 0 ? errorStacks : undefined;

		return {
			message: this.dataParserHelper.toString(args),
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
		DataParserHelper,
	],
	useFactory: (
		inquirer: string | object,
		configService: ConfigService,
		dataParserHelper: DataParserHelper,
	): LoggerService => new LoggerService(inquirer, configService, dataParserHelper),

	durable: false,
};
