import { INQUIRER } from '@nestjs/core';
import { Injectable, Inject, forwardRef, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createLogger, Logger } from 'winston';
import { ConfigsInterface } from '@core/configs/configs.config';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import { wrapperType } from '@shared/types/constructorType';
import {
	LoggerInterface, LogLevelEnum, MetadataInterface,
	getLoggerOptions, getDefaultFormat, getMessageFormatter
} from './logger';


@Injectable({ scope: Scope.TRANSIENT })
export default class LoggerService implements LoggerInterface {
	private contextName!: string;
	private requestId?: string;
	private readonly logger: Logger;

	constructor(
		@Inject(INQUIRER) // ? get inquirer class
		private readonly inquirer: string | object,
		private readonly configService: ConfigService,
		@Inject(forwardRef(() => DataParserHelper)) // ? resolve circular dependency
		private readonly dataParserHelper: wrapperType<DataParserHelper>,
	) {
		const applicationConfigs = this.configService.get<ConfigsInterface['application']>('application')!;

		const messageFormatter = getMessageFormatter(this.dataParserHelper.toString);

		const defaultFormat = getDefaultFormat(
			applicationConfigs.stackErrorVisible === 'true',
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
		this.requestId = this.configService.get<string>('requestId');
		return this.requestId;
	}

	public setRequestId(requestId: string | undefined): void {
		this.requestId = requestId;
		this.configService.set<string | undefined>('requestId', requestId);
	}

	private buildLog(args: any[]): { message: string, meta: MetadataInterface } {
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
		args.forEach(arg => {
			if (arg instanceof Error) {
				message += `${arg.name}: ${arg.message}${separator}`;
				if (arg.stack)
					metadata.stack = arg.stack;
			}
			else if (typeof arg === 'string')
				message += `${arg}${separator}`;
			else
				message += `${this.dataParserHelper.toString(arg)}${separator}`;
		});

		return {
			message,
			meta: metadata,
		};
	}

	[LogLevelEnum.ERROR](...args: any[]): void {
		const { message, meta } = this.buildLog(args);

		this.logger.log({
			level: LogLevelEnum.ERROR,
			message,
			meta,
		});
	}

	[LogLevelEnum.WARN](...args: any[]): void {
		const { message, meta } = this.buildLog(args);

		this.logger.log({
			level: LogLevelEnum.WARN,
			message,
			meta,
		});
	}

	[LogLevelEnum.INFO](...args: any[]): void {
		const { message, meta } = this.buildLog(args);

		this.logger.log({
			level: LogLevelEnum.INFO,
			message,
			meta,
		});
	}

	[LogLevelEnum.HTTP](...args: any[]): void {
		const { message, meta } = this.buildLog(args);

		this.logger.log({
			level: LogLevelEnum.HTTP,
			message,
			meta,
		});
	}

	[LogLevelEnum.VERBOSE](...args: any[]): void {
		const { message, meta } = this.buildLog(args);

		this.logger.log({
			level: LogLevelEnum.VERBOSE,
			message,
			meta,
		});
	}

	[LogLevelEnum.DEBUG](...args: any[]): void {
		const { message, meta } = this.buildLog(args);

		this.logger.log({
			level: LogLevelEnum.DEBUG,
			message,
			meta,
		});
	}
}
