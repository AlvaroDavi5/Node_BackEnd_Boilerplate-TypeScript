
type RedisStatus = 'wait' | 'reconnecting' | 'connecting' | 'connect' | 'ready' | 'close' | 'end';
type RedisKey = string | Buffer;
type Callback<T = unknown> = (err?: Error | null, result?: T) => void;

export class IoRedis {
	public status: RedisStatus;

	constructor() {
		this.status = 'ready';
	}

	connect(callback?: Callback<void>): Promise<void> {
		if (callback) {
			callback();
		}

		return Promise.resolve();
	}

	quit(callback?: Callback<'OK'>): Promise<'OK'> {
		if (callback) {
			callback(null, 'OK');
		}

		return Promise.resolve('OK');
	}

	keys(_pattern: string, callback?: Callback<string[]>): Promise<string[]> {
		const result: string[] = [];

		if (callback) {
			callback(null, result);
		}

		return Promise.resolve(result);
	}

	get(_key: RedisKey, callback?: Callback<string | null>): Promise<string | null> {
		const result: string | null = null;

		if (callback) {
			callback(null, result);
		}

		return Promise.resolve(result);
	}

	set(_key: RedisKey, _value: string | Buffer | number, callback?: Callback<'OK'>): Promise<'OK'> {
		if (callback) {
			callback(null, 'OK');
		}

		return Promise.resolve('OK');
	}

	expire(_key: RedisKey, _seconds: number | string, callback?: Callback<number>): Promise<number> {
		const result = 1;

		if (callback) {
			callback(null, result);
		}

		return Promise.resolve(result);
	}

	mget(..._args: [keys: RedisKey[]]): Promise<(string | null)[]> {
		const result: (string | null)[] = [];

		return Promise.resolve(result);
	}

	del(...args: [...keys: RedisKey[]]): Promise<number> {
		const result = args.length;

		return Promise.resolve(result);
	}

	flushall(callback?: Callback<'OK'>): Promise<'OK'> {
		if (callback) {
			callback(null, 'OK');
		}

		return Promise.resolve('OK');
	}

	scanStream(_options?: unknown): unknown {
		return {};
	}

	pipeline(_commands?: unknown[][]): unknown {
		return {};
	}
}
