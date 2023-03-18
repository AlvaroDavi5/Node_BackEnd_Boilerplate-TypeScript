
export default class ExceptionGenerator extends Error {
	public statusCode!: number | undefined;
	public errorType!: string | undefined;
	public details!: any;

	constructor(message: string) {
		super(message);
		Object.setPrototypeOf(this, ExceptionGenerator.prototype);
	}

	getName(): string {
		return this.name;
	}

	setName(name: string): void {
		this.name = name;
	}

	getMessage(): string {
		return this.message;
	}

	setMessage(message: string | undefined): void {
		if (message)
			this.message = message;
	}

	getCode(): number | undefined {
		return this.statusCode;
	}

	setCode(code: number | undefined): void {
		if (code)
			this.statusCode = code;
	}

	getErrorType(): string | undefined {
		return this.errorType;
	}

	setErrorType(type: string | undefined): void {
		if (type)
			this.errorType = type;
	}

	getDetails(): any {
		return this.details;
	}

	setDetails(details: any): void {
		if (details)
			this.details = details;
	}

	getStack(): string | undefined {
		return this.stack;
	}

	setStack(stack: string | undefined): void {
		if (stack)
			this.stack = stack;
	}
}
