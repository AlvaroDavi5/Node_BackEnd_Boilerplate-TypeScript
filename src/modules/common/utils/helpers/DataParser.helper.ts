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
					result = '';
				else if (Array.isArray(data)) {
					const parsedData = data.map((d) => this.toString(d));
					result = `${parsedData.join(', ')}`;
				} else if (data instanceof Error)
					result = data.toString();
				else
					result = (JSON.stringify(data) || data?.toString()) ?? '';
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

	public toObject<OT = object>(data: string): { data: OT | null, error?: Error } {
		try {
			return { data: JSON.parse(data) };
		} catch (error) {
			return { data: null, error: error as Error };
		}
	}
}
