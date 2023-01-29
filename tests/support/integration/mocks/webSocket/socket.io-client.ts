
export class Client {
	httpServer: any;
	options!: any;

	constructor(httpServer?: any, options?: any) {
		this.httpServer = httpServer || null;
		this.options = options || {};
	}

	on: (event: string, callback: any) => {};
	off: (event: string, callback: any) => {};
	emit: (event: string, msg: string) => {};
	connected: () => true;
	connect: (event: string, msg: string) => {};
	disconnect: (event: string, msg: string) => {};
}

let client: Client;

export function getClientInstance() {
	if (!client) {
		client = new Client();
	}
	return client;
}
