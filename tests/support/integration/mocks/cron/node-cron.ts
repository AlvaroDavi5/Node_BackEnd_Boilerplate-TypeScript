
export class Cron {
	schedule: any;

	constructor() {
		this.schedule = (cronExpression: String, callback: any, options = {}) => {
			if (cronExpression.length)
				callback();

			return {
				start: () => { },
			};
		};

		return {
			schedule: this.schedule,
		};
	}
}

let cron: Cron;

export function getCronInstance() {
	if (!cron) {
		cron = new Cron();
	}
	return cron;
}
