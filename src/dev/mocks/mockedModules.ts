import { Readable } from 'stream';
import { v4 as uuidV4 } from 'uuid';
import envsConfig, { ConfigsInterface } from '@core/configs/envs.config';
import { LoggerInterface } from '@core/logging/logger';


export const configServiceMock = {
	get: (propertyPath?: string): any => {
		let scopedProperty = envsConfig();

		if (propertyPath) {
			const splitedPaths = propertyPath.split('.') as (keyof ConfigsInterface)[];

			for (const scopedPath of splitedPaths) {
				if (scopedPath.length)
					scopedProperty = scopedProperty[String(scopedPath) as keyof ConfigsInterface] as unknown as ConfigsInterface;
			}

			return scopedProperty;
		} else
			return scopedProperty;
	},
};

export const cryptographyServiceMock = {
	generateUuid: (): string => {
		return uuidV4();
	}
};

export const loggerProviderMock: LoggerInterface & {
	setContextName: (context: string) => void,
	setRequestId: (requestId: string) => void,
} = {
	error: console.error,
	warn: console.warn,
	info: console.info,
	http: console.info,
	verbose: console.log,
	debug: console.debug,
	setContextName: (context: string) => {
		context.trim();
	},
	setRequestId: (requestId: string) => {
		requestId.trim();
	},
};

export const dataParserHelperMock = {
	toString: (data: unknown, returnUndefined = false): string => {
		const defaultParse = String(data);
		const circularReference = '[Circular]';

		if (typeof data === 'string')
			return data;
		if (typeof data === 'undefined')
			return returnUndefined ? 'undefined' : '';
		if (typeof data === 'object') {
			if (!data) {
				return defaultParse;
			}

			if (Array.isArray(data)) {
				const parsedData = data.map((element) => element === data ? circularReference : String(element));
				return parsedData.join(', ');
			}

			if (data instanceof Error) {
				return `${data?.name}: ${data?.message}`;
			}

			try {
				for (const key of Object.keys(data)) {
					if ((data as Record<string, unknown>)[String(key)] === data) {
						(data as Record<string, unknown>)[String(key)] = circularReference;
					}
				}
				return JSON.stringify(data);
			} catch (_error) {
				return defaultParse;
			}
		}

		return defaultParse;
	},

	toObject: <OT = object>(data: string): OT | null => {
		try {
			return JSON.parse(data) as OT;
		} catch (_error) {
			return null;
		}
	},

	toBuffer: async (data: string | Uint8Array | Buffer | Readable | ReadableStream | Blob, encoding: BufferEncoding): Promise<Buffer> => {
		if (Buffer.isBuffer(data)) {
			return data;
		}

		if (typeof data === 'string') {
			return Buffer.from(data, encoding);
		}

		if (data instanceof Uint8Array) {
			return Buffer.from(data);
		}

		if (data instanceof Readable) {
			const chunks: Uint8Array[] = [];

			for await (const chunk of data) {
				chunks.push(chunk);
			}

			return Buffer.concat(chunks);
		}

		if (typeof Blob !== 'undefined' && data instanceof Blob) {
			const arrayBuffer = await data.arrayBuffer();
			return Buffer.from(arrayBuffer);
		}

		if (typeof ReadableStream !== 'undefined' && data instanceof ReadableStream && typeof data?.getReader === 'function') {
			const reader = data.getReader();
			const chunks = [];
			let totalLength = 0;

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				chunks.push(value);
				totalLength += value.length;
			}

			const combined = new Uint8Array(totalLength);
			let offset = 0;
			for (const chunk of chunks) {
				combined.set(chunk, offset);
				offset += chunk.length;
			}

			return Buffer.from(combined);
		}

		throw new Error('Unsupported body type');
	},
};
