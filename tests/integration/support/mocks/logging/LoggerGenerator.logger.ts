import { Injectable } from '@nestjs/common';
import { MockObservableInterface } from '../mockObservable';


@Injectable()
export default class LoggerGenerator {
	showLogs: boolean;

	constructor(
		private readonly mockObservable: MockObservableInterface,
	) {
		this.showLogs = Boolean(process.env.SHOW_LOGS);
	}

	public getLogger(): any {
		const justCallMockObservable = (...args: unknown[]): void => {
			this.mockObservable.call(args);
		};
		const logAndCallMockObservable = (...args: unknown[]): void => {
			this.mockObservable.call(args);
			console.log(args);
		};

		return {
			error: this.showLogs ? logAndCallMockObservable : justCallMockObservable,
			warn: this.showLogs ? logAndCallMockObservable : justCallMockObservable,
			info: this.showLogs ? logAndCallMockObservable : justCallMockObservable,
			debug: justCallMockObservable,
			log: justCallMockObservable,
		};
	}
}
