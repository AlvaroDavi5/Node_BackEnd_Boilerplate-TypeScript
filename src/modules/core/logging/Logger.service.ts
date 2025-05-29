import { INQUIRER } from '@nestjs/core';
import { Injectable, Inject, Provider, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createLogger, Logger } from 'winston';
import { ConfigsInterface } from '@core/configs/envs.config';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import { captureMessage, captureLog } from '@common/utils/sentryCalls.util';
import { LoggerInterface, LogLevelEnum, MetadataInterface, getLoggerOptions } from './logger';


@Injectable({ scope: Scope.TRANSIENT })
export default class LoggerService implements LoggerInterface {
	private contextName!: string;
	private requestId?: string;
	private socketId?: string;
	private clientIp?: string;
	private readonly logger: Logger;

	constructor(
		@Inject(INQUIRER) private readonly inquirer: string | object, // ? get inquirer class
		private readonly configService: ConfigService,
		// @Inject(forwardRef(() => DataParserHelper)) // ? resolve circular dependency
		// private readonly dataParserHelper: wrapperType<DataParserHelper>,
		private readonly dataParserHelper: DataParserHelper,
	) {
		const applicationConfigs = this.configService.get<ConfigsInterface['application']>('application')!;

		const loggerOptions = getLoggerOptions(
			applicationConfigs.name,
			applicationConfigs.environment,
			undefined as unknown as string,
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

	public getSocketId(): string | undefined {
		return this.socketId;
	}

	public setSocketId(socketId: string | undefined): void {
		this.socketId = socketId;
	}

	public getClientIp(): string | undefined {
		return this.clientIp;
	}

	public setClientIp(clientIp: string | undefined): void {
		this.clientIp = clientIp;
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
			socketId: this.getSocketId(),
			ip: this.getClientIp(),
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

	public [LogLevelEnum.ERROR](...args: unknown[]): void {
		const { message, meta } = this.buildLog(args);

		this.logger.log({
			level: LogLevelEnum.ERROR,
			message,
			meta,
		});

		captureLog(message, LogLevelEnum.ERROR);
	}

	public [LogLevelEnum.WARN](...args: unknown[]): void {
		const { message, meta } = this.buildLog(args);

		this.logger.log({
			level: LogLevelEnum.WARN,
			message,
			meta,
		});

		captureLog(message, LogLevelEnum.WARN);
		captureMessage(message, LogLevelEnum.WARN);
	}

	public [LogLevelEnum.INFO](...args: unknown[]): void {
		const { message, meta } = this.buildLog(args);

		this.logger.log({
			level: LogLevelEnum.INFO,
			message,
			meta,
		});

		captureLog(message, LogLevelEnum.INFO);
	}

	public [LogLevelEnum.HTTP](...args: unknown[]): void {
		const { message, meta } = this.buildLog(args);

		this.logger.log({
			level: LogLevelEnum.HTTP,
			message,
			meta,
		});

		captureLog(message, LogLevelEnum.HTTP);
	}

	public [LogLevelEnum.VERBOSE](...args: unknown[]): void {
		const { message, meta } = this.buildLog(args);

		this.logger.log({
			level: LogLevelEnum.VERBOSE,
			message,
			meta,
		});

		captureLog(message, LogLevelEnum.VERBOSE);
	}

	public [LogLevelEnum.DEBUG](...args: unknown[]): void {
		const { message, meta } = this.buildLog(args);

		this.logger.log({
			level: LogLevelEnum.DEBUG,
			message,
			meta,
		});

		captureLog(message, LogLevelEnum.DEBUG);
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
