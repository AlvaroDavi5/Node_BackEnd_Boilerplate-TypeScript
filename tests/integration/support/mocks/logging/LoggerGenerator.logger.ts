import { Injectable } from '@nestjs/common';


@Injectable()
export default class LoggerGenerator {
	showLogs: boolean;

	constructor() {
		this.showLogs = Boolean(process.env.SHOW_LOGS);
	}

	public getLogger(): any {
		const commomLogger = (value: any) => console.log(value?.message || value);
		const errorLogger = (value: any) => console.error(value?.message || value);

		return {
			error: this.showLogs ? errorLogger : commomLogger,
			warn: this.showLogs ? errorLogger : commomLogger,
			info: commomLogger,
			debug: commomLogger,
			log: commomLogger,
		};
	}
}
