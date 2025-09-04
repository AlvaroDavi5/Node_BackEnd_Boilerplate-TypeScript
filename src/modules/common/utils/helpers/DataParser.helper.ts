import { Readable } from 'stream';
import { Injectable } from '@nestjs/common';


@Injectable()
export default class DataParserHelper {
	public toString(data: unknown, returnUndefined = false): string {
		const circularReference = '[Circular Reference]';

		if (typeof data === 'string')
			return data;
		if (typeof data === 'symbol')
			return data.toString();
		if (typeof data === 'undefined')
			return returnUndefined ? 'undefined' : '';

		if (typeof data === 'object') {
			const fallback = String(data);

			if (!data) {
				return fallback;
			}
			if (data instanceof Error) {
				return `${data?.name}: ${data?.message}`;
			}

			if (Array.isArray(data)) {
				const seen = new WeakSet<unknown[]>();
				const visit = (array: unknown[]): string => {
					if (seen.has(array)) {
						return circularReference;
					}
					seen.add(array);
					const parsedData = array.map((element) => Array.isArray(element) ? visit(element) : this.toString(element, returnUndefined));
					return parsedData.join(', ');
				};
				return visit(data);
			}
			try {
				return JSON.stringify(data);
			} catch (error) {
				if (error instanceof Error && error.message.includes('circular')) {
					const seen = new WeakSet();
					const stringified = JSON.stringify(data, (_key, value) => {
						if (typeof value === 'object' && value !== null) {
							if (seen.has(value)) {
								return circularReference;
							}
							seen.add(value);
						}
						return value;
					});
					return stringified;
				}

				return fallback;
			}
		}

		return String(data);
	}

	public toObject<OT = object>(data: string): OT | null {
		try {
			return JSON.parse(data) as OT;
		} catch (_error) {
			return null;
		}
	}

	public async toBuffer(data: string | Uint8Array | Buffer | Readable | ReadableStream | Blob, encoding: BufferEncoding): Promise<Buffer> {
		if (Buffer.isBuffer(data))
			return data;

		if (typeof data === 'string')
			return Buffer.from(data, encoding);

		if (data instanceof Uint8Array)
			return Buffer.from(data);

		if (data instanceof Readable)
			return await this.readableToBuffer(data);

		if (typeof Blob !== 'undefined' && data instanceof Blob) {
			const arrayBuffer = await data.arrayBuffer();
			return Buffer.from(arrayBuffer);
		}

		if (typeof ReadableStream !== 'undefined' && data instanceof ReadableStream && typeof data?.getReader === 'function')
			return await this.readableStreamToBuffer(data);

		throw new Error('Unsupported body type');
	}

	private async readableToBuffer(data: Readable): Promise<Buffer> {
		const chunks: Uint8Array[] = [];

		for await (const chunk of data) {
			chunks.push(chunk);
		}

		return Buffer.concat(chunks);
	}

	private async readableStreamToBuffer(data: ReadableStream): Promise<Buffer> {
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
}
