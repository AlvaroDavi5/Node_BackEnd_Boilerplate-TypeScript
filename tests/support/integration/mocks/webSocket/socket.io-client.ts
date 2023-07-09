
export class Client {
	httpServer: any;
	options!: any;

	constructor(httpServer?: any, options?: any) {
		this.httpServer = httpServer || null;
		this.options = options || {};
	}

	on: (event: String, callback: any) => {};
	off: (event: String, callback: any) => {};
	emit: (event: String, msg: String) => {};
	connected: () => true;
	connect: (event: String, msg: String) => {};
	disconnect: (event: String, msg: String) => {};
}

let client: Client;

export function getClientInstance() {
	if (!client) {
		client = new Client();
	}
	return client;
}
