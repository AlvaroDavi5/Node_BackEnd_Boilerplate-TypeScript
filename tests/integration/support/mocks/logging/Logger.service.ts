import { Injectable, Provider, Scope } from '@nestjs/common';
import { LoggerInterface } from '@core/logging/logger';
import { mockObservable } from '../mockObservable';


type logLevelType = 'error' | 'warn' | 'info' | 'debug' | 'log';

@Injectable({ scope: Scope.TRANSIENT })
export default class LoggerService implements LoggerInterface {
	private readonly showLogs = process.env.SHOW_LOGS === 'true';

	private log(level: logLevelType, args: unknown[]): void {
		const shouldLog = this.showLogs === true && ['error', 'warn'].includes(level);

		args.forEach((arg: unknown) => {
			if (mockObservable?.call)
				mockObservable.call(arg);
			if (shouldLog)
				console[String(level) as logLevelType](arg);
		});
	}

	/* eslint-disable @typescript-eslint/no-empty-function */
	public getContextName(): string {
		return 'LoggerServiceMock';
	}

	public setContextName(contextName: string): void {
		contextName.trim();
	}

	public getRequestId(): string | undefined {
		return 'request_id';
	}

	public setRequestId(_requestId: string | undefined): void { }

	public getMessageId(): string | undefined {
		return 'message_id';
	}

	public setMessageId(_messageId: string | undefined): void { }

	public getSocketId(): string | undefined {
		return 'socket_id';
	}

	public setSocketId(_socketId: string | undefined): void { }

	public getClientIp(): string | undefined {
		return 'client_ip';
	}

	public setClientIp(_clientIp: string | undefined): void { }
	/* eslint-enable @typescript-eslint/no-empty-function */

	public error(...args: unknown[]): void {
		this.log('error', args);
	}
	public warn(...args: unknown[]): void {
		this.log('warn', args);
	}
	public info(...args: unknown[]): void {
		this.log('info', args);
	}
	public http(...args: unknown[]): void {
		this.log('info', args);
	}
	public verbose(...args: unknown[]): void {
		this.log('log', args);
	}
	public debug(...args: unknown[]): void {
		this.log('debug', args);
	}
}

export const REQUEST_LOGGER_PROVIDER = Symbol('RequestLoggerProvider');
export const RequestLoggerProvider: Provider = {
	provide: REQUEST_LOGGER_PROVIDER,
	scope: Scope.REQUEST,

	inject: [],
	useFactory: (): LoggerService => new LoggerService(),

	durable: false,
};
