
export default class Application {
	logger: string;

	constructor(logger: string) {
		this.logger = logger;
	}

	start() {
		console.log(this.logger);
	}
}
