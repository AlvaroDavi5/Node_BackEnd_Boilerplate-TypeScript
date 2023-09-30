
export class Server {
	httpServer: any;
	options!: any;
	private _emit: (event: string, msg: string) => void;
	private _on: (event: string, callback: () => void) => void;

	constructor(httpServer?: any, options?: any) {
		this.httpServer = httpServer || null;
		this.options = options || {};

		this._emit = (event = '', msg = '') => {
			console.log('New event:', event);
		};
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

	on(event: string, callback: any) {
		console.log('New event:', event);
	}

	to(socketId: string) {
		return {
			emit: (event: string, msg: string) => {
				console.log('New event:', event);
			},
		};
	}

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
