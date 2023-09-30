
export default class LoggerGenerator {
	showLogs: boolean;

	constructor() {
		this.showLogs = Boolean(process.env.SHOW_LOGS);
	}

	public getLogger(): any {
		let errorLogger = (value: any) => { };

		if (this.showLogs) {
			errorLogger = (value: any) => console.error(value?.message || value);
		}

		return {
			error: errorLogger,
			warn: errorLogger,
			info: (value: any) => { },
			debug: (value: any) => { },
			log: (value: any) => { },
		};
	}
}
