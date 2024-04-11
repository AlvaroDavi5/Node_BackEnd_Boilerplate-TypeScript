import { Injectable } from '@nestjs/common';
import { MockObservableInterface } from '../mockObservable';
import { LoggerProviderInterface } from '@core/infra/logging/Logger.provider';


@Injectable()
export default class LoggerProvider implements LoggerProviderInterface {
	private readonly logger: any;

	constructor(
		private readonly mockObservable: MockObservableInterface,
	) {
		const showLogs = Boolean(process.env.SHOW_LOGS);

		const justCallMockObservable = (...args: unknown[]): void => {
			args.forEach((arg: unknown) => this.mockObservable.call(arg));
		};
		const logAndCallMockObservable = (...args: unknown[]): void => {
			args.forEach((arg: unknown) => {
				this.mockObservable.call(arg);
				console.log(arg);
			});
		};

		this.logger = {
			error: showLogs ? logAndCallMockObservable : justCallMockObservable,
			warn: showLogs ? logAndCallMockObservable : justCallMockObservable,
			info: showLogs ? logAndCallMockObservable : justCallMockObservable,
			debug: justCallMockObservable,
			log: justCallMockObservable,
		};
	}

	public getLogger(context: string): any {
		return this.logger;
	}
}
