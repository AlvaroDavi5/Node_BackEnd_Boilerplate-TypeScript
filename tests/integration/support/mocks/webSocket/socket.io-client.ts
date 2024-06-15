export class ClientSocket {
	public connected: boolean;

	constructor() {
		this.connected = true;
	}

	public on(ev: string, listener?: ((...args: any[]) => void)): this {
		return this;
	}

	public off(ev?: string, listener?: ((...args: any[]) => void)): this {
		return this;
	}

	public emit(ev: string, ...args: any[]): this {
		return this;
	}

	public connect(): this {
		this.connected = true;
		return this;
	}

	public disconnect(): this {
		this.connected = false;
		return this;
	}
}
