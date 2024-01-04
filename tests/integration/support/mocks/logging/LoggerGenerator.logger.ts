import { Injectable } from '@nestjs/common';
import { MockObservableInterface } from '../mockObservable';


@Injectable()
export default class LoggerGenerator {
	private readonly logger: any;

	constructor(
		private readonly mockObservable: MockObservableInterface,
	) {
		const showLogs = Boolean(process.env.SHOW_LOGS);

		const justCallMockObservable = (...args: unknown[]): void => {
			this.mockObservable.call(args);
		};
		const logAndCallMockObservable = (...args: unknown[]): void => {
			this.mockObservable.call(args);
			console.log(args);
		};

		this.logger = {
			error: showLogs ? logAndCallMockObservable : justCallMockObservable,
			warn: showLogs ? logAndCallMockObservable : justCallMockObservable,
			info: showLogs ? logAndCallMockObservable : justCallMockObservable,
			debug: justCallMockObservable,
			log: justCallMockObservable,
		};
	}

	public getLogger(): any {
		return this.logger;
	}
}
