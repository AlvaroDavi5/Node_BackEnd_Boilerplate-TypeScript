
// eslint-disable-next-line max-classes-per-file
export class Server {
	httpServer: unknown;
	options!: unknown;
	public readonly sockets: { fetchSockets: () => unknown[] };

	constructor(httpServer?: unknown, options?: unknown) {
		this.httpServer = httpServer || null;
		this.options = options || {};

		this.sockets = {
			fetchSockets: () => [
				{ id: '#1' },
				{ id: '#2' },
			],
		};
	}

	public setMaxListeners(_listenersNumber: number): this {
		return this;
	}

	public on(_ev: string, _listener?: ((...args: unknown[]) => void)): this {
		return this;
	}

	public to(_socketIdsOrRooms: string | string[]) {
		return {
			emit: (_ev: string, ..._args: unknown[]): boolean => {
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
	public broadcast: { emit: (ev: string, ...args: unknown[]) => boolean; };

	constructor() {
		this.id = 'mockedSocket';
		this.connected = true;
		this.broadcast = {
			emit: this.emit,
		};
	}

	public on(_ev: string, _listener?: ((...args: unknown[]) => void)): this {
		return this;
	}

	public off(_eventName: string | symbol, _listener: (...args: unknown[]) => void): this {
		return this;
	}

	public emit(_ev: string, ..._args: unknown[]): boolean {
		return true;
	}

	public disconnect(): this {
		this.connected = false;
		return this;
	}
}
