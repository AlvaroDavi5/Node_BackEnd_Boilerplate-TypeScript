
export default class ExceptionGenerator extends Error {
	public errorType!: string | any;
	public details!: any;
	public statusCode!: number;

	constructor(msg: string) {
		super(msg);
		Object.setPrototypeOf(this, ExceptionGenerator.prototype);
	}

	getMessage() {
		return `${this.message}`;
	}
}
