
export default class ExceptionGenerator extends Error {
	errorType!: string | any;
	details!: any;
	statusCode!: number;

	constructor(msg: string) {
		super(msg);
		Object.setPrototypeOf(this, ExceptionGenerator.prototype);
	}

	getMessage() {
		return `${this.message}`;
	}
}
