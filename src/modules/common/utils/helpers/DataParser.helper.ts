import { Readable } from 'stream';
import { Injectable } from '@nestjs/common';


@Injectable()
export default class DataParserHelper {
	public toString(data: unknown): string {
		let result = '';

		switch (typeof data) {
			case 'bigint':
				result = data.toString();
				break;
			case 'number':
				result = data.toString();
				break;
			case 'boolean':
				result = data.toString();
				break;
			case 'string':
				result = data;
				break;
			case 'object':
				if (!data)
					break;
				else if (Array.isArray(data)) {
					const parsedData = data.map((d) => this.toString(d));
					result = `${parsedData.join(', ')}`;
				} else if (data instanceof Error)
					result = `${data?.name}: ${data?.message}`;
				else {
					try {
						result = JSON.stringify(data);
					} catch (_error) {
						result = data?.toString() ?? '';
					}
				}
				break;
			case 'symbol':
				result = data.toString();
				break;
			case 'function':
				result = data.toString();
				break;
			default:
				break;
		}

		return result;
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
