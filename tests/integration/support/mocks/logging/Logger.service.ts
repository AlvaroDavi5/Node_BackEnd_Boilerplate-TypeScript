import { Injectable, Provider, Scope } from '@nestjs/common';
import { LoggerInterface } from '@core/logging/logger';
import { MockObservableInterface } from '../mockObservable';


@Injectable({ scope: Scope.TRANSIENT })
export default class LoggerService implements LoggerInterface {
	private readonly showLogs = Boolean(process.env.SHOW_LOGS);

	constructor(
		private readonly mockObservable?: MockObservableInterface<void, unknown[]>,
	) { }

	private log(level: 'error' | 'warn' | 'info' | 'debug' | 'log', args: unknown[]): void {
		const shouldLog = (this.showLogs === true) && (['error', 'warn'].includes(level));

		args.forEach((arg: unknown) => {
			if (this.mockObservable?.call)
				this.mockObservable.call(arg);
			if (shouldLog)
				console[level](arg);
		});
	}

	public getContextName(): string {
		return 'LoggerServiceMock';
	}

	public setContextName(context: string): void {
		context.trim();
	}

	public getRequestId(): string {
		return 'LoggerServiceMock';
	}

	public setRequestId(requestId: string): void {
		requestId.trim();
	}

	public error(...args: unknown[]): void { this.log('error', args); }
	public warn(...args: unknown[]): void { this.log('warn', args); }
	public info(...args: unknown[]): void { this.log('info', args); }
	public http(...args: unknown[]): void { this.log('info', args); }
	public verbose(...args: unknown[]): void { this.log('log', args); }
	public debug(...args: unknown[]): void { this.log('debug', args); }
}

export const REQUEST_LOGGER_PROVIDER = Symbol('RequestLoggerProvider');
export const RequestLoggerProvider: Provider = {
	provide: REQUEST_LOGGER_PROVIDER,
	scope: Scope.REQUEST,

	inject: [],
	useFactory: (): LoggerService => new LoggerService(),

	durable: false,
};

export const SINGLETON_LOGGER_PROVIDER = Symbol('SingletonLoggerProvider');
export interface LoggerProviderInterface {
	getLogger: (context: string) => LoggerService,
}
export const SingletonLoggerProvider: Provider = {
	provide: SINGLETON_LOGGER_PROVIDER,
	scope: Scope.DEFAULT,

	inject: [],
	useFactory: (): LoggerProviderInterface => ({
		getLogger: (_context: string): LoggerService => new LoggerService(),
	}),

	durable: false,
};
