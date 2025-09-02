import { Readable } from 'stream';
import { Injectable } from '@nestjs/common';


@Injectable()
export default class DataParserHelper {
	public toString(data: unknown, returnUndefined = false): string {
		const circularReference = '[Circular]';

		if (typeof data === 'string')
			return data;
		if (typeof data === 'symbol')
			return data.toString();
		if (typeof data === 'undefined')
			return returnUndefined ? 'undefined' : '';

		if (typeof data === 'object') {
			if (!data) {
				return String(data);
			}

			if (Array.isArray(data)) {
				const parsedData = data.map((element) => element === data ? circularReference : this.toString(element, returnUndefined));
				return parsedData.join(', ');
			}

			if (data instanceof Error) {
				return `${data?.name}: ${data?.message}`;
			}

			try {
				const parsedData = data;
				for (const key of Object.keys(parsedData)) {
					if ((parsedData as Record<string, unknown>)[String(key)] === parsedData)
						(parsedData as Record<string, unknown>)[String(key)] = circularReference;
				}
				return JSON.stringify(parsedData);
			} catch (_error) {
				return String(data);
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
