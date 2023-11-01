
export class Server {
	httpServer: any;
	options!: any;
	private _emit: (event: string, msg: string) => void;
	private _on: (event: string, callback: () => void) => void;
	public sockets: { fetchSockets: () => any[] };

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

		this.sockets = {
			fetchSockets: () => [
				{ id: '#1' },
				{ id: '#2' },
			]
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

	disconnectSockets(): void { };
}

let server: Server;

export function getServerInstance() {
	if (!server) {
		server = new Server();
	}
	return server;
}
