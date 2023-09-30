
export default class LoggerGenerator {
	showLogs: boolean;

	constructor() {
		this.showLogs = Boolean(process.env.SHOW_LOGS);
	}

	public getLogger(): any {
		const commomLogger = (value: any) => console.log(value?.message || value);
		let errorLogger = (value: any) => console.error(value?.message || value);

		if (this.showLogs) {
			errorLogger = (value: any) => console.error(value?.message || value);
		}

		return {
			error: this.showLogs ? errorLogger : commomLogger,
			warn: this.showLogs ? errorLogger : commomLogger,
			info: commomLogger,
			debug: commomLogger,
			log: commomLogger,
		};
	}
}
