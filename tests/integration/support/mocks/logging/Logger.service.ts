import { Injectable } from '@nestjs/common';
import { MockObservableInterface } from '../mockObservable';


@Injectable()
export default class LoggerService {
	private readonly showLogs = Boolean(process.env.SHOW_LOGS);

	constructor(
		private readonly mockObservable: MockObservableInterface,
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

	public error(...args: any[]): void { this.log('error', args); }
	public warn(...args: any[]): void { this.log('warn', args); }
	public info(...args: any[]): void { this.log('info', args); }
	public http(...args: any[]): void { this.log('info', args); }
	public verbose(...args: any[]): void { this.log('log', args); }
	public debug(...args: any[]): void { this.log('debug', args); }
}
