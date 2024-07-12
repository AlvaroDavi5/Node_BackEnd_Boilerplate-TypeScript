export class ClientSocket {
	public connected: boolean;

	constructor() {
		this.connected = true;
	}

	public on(_ev: string, _listener?: ((...args: any[]) => void)): this {
		return this;
	}

	public off(_ev?: string, _listener?: ((...args: any[]) => void)): this {
		return this;
	}

	public emit(_ev: string, ..._args: any[]): this {
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
