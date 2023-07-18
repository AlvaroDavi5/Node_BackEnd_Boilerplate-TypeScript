
export class Server {
	httpServer: any;
	options!: object;
	private _emit: (event: String, msg: String) => void;
	private _on: (event: String, callback: () => void) => void;

	constructor(httpServer?: any, options?: object) {
		this.httpServer = httpServer || null;
		this.options = options || {};

		this._emit = (event = '', msg = '') => { };
		this._on = (event = '', callback: any) => {
			const socket = {
				id: 'mockedSocket',
				on: this._on,
				broadcast: {
					emit: this._emit,
				},
			};
			const msg = {
				connectionId: socket.id,
				token: 'xxx',
				dataValues: {
					connectionId: socket.id,
					clientId: 'mockedClient',
					userId: 0,
					merchantIds: [1, 2],
					createdAt: new Date(),
				},
				targetSocketId: 'mockedTargetSocket',
				payload: {},
			};

			if (event === 'connection')
				callback(socket);
			else
				callback(JSON.stringify(msg));
		};
	}

	on: (event: String, callback: any) => {};
	to: (socketId: String) => {
		emit: (event: String, msg: String) => {},
	};

	disconnectSockets: () => null;
	sockets: {
		fetchSockets: () => [
			{ id: 1 },
			{ id: 2 },
		]
	};
}

let server: Server;

export function getServerInstance() {
	if (!server) {
		server = new Server();
	}
	return server;
}
