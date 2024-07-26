
// eslint-disable-next-line max-classes-per-file
export class Server {
	httpServer: any;
	options!: any;
	public readonly sockets: { fetchSockets: () => any[] };

	constructor(httpServer?: any, options?: any) {
		this.httpServer = httpServer || null;
		this.options = options || {};

		this.sockets = {
			fetchSockets: () => ([
				{ id: '#1' },
				{ id: '#2' },
			]),
		};
	}

	public setMaxListeners(_listenersNumber: number): this {
		return this;
	}

	public on(_ev: string, _listener?: ((...args: any[]) => void)): this {
		return this;
	}

	public to(_socketIdsOrRooms: string | string[]) {
		return {
			emit: (_ev: string, ..._args: any[]): boolean => {
				return true;
			},
		};
	}

	public disconnectSockets(): void {
		console.log('All Disconnected!');
	}
}

// eslint-disable-next-line max-classes-per-file
export class ServerSocket {
	public readonly id: string;
	public connected: boolean;
	public broadcast: { emit: (ev: string, ...args: any[]) => boolean; };

	constructor() {
		this.id = 'mockedSocket';
		this.connected = true;
		this.broadcast = {
			emit: this.emit,
		};
	}

	public on(_ev: string, _listener?: ((...args: any[]) => void)): this {
		return this;
	}

	public off(_eventName: string | symbol, _listener: (...args: any[]) => void): this {
		return this;
	}

	public emit(_ev: string, ..._args: any[]): boolean {
		return true;
	}

	public disconnect(): this {
		this.connected = false;
		return this;
	}
}
