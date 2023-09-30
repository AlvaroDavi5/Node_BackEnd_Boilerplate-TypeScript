
export class Client {
	httpServer: any;
	options!: any;

	constructor(httpServer?: any, options?: any) {
		this.httpServer = httpServer || null;
		this.options = options || {};
	}

	public on(event: string, callback: any) {
		console.log('New event:', event);
	}

	public off(event: string, callback: any) {
		console.log('New event:', event);
	}

	public emit(event: string, msg: string) {
		console.log('New event:', event);
	}

	public connected() {
		return true;
	}

	public connect(event: string, msg: string) {
		console.log('New event:', event);
	}

	public disconnect(event: string, msg: string) {
		console.log('New event:', event);
	}
}

let client: Client;

export function getClientInstance() {
	if (!client) {
		client = new Client();
	}
	return client;
}
