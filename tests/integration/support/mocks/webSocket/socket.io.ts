
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

	public setMaxListeners(listenersNumber: number): this {
		return this;
	}

	public on(ev: string, listener?: ((...args: any[]) => void)): this {
		return this;
	}

	public to(socketIdsOrRooms: string | string[]) {
		return {
			emit: (ev: string, ...args: any[]): boolean => {
				return true;
			},
		};
	}

	public disconnectSockets(): void {
		console.log('All Disconnected!');
	}
}

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

	public on(ev: string, listener?: ((...args: any[]) => void)): this {
		return this;
	}

	public off(eventName: string | symbol, listener: (...args: any[]) => void): this {
		return this;
	}

	public emit(ev: string, ...args: any[]): boolean {
		return true;
	}

	public disconnect(): this {
		this.connected = false;
		return this;
	}
}
