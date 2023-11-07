import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Logger } from 'winston';
import LoggerGenerator from '@core/infra/logging/LoggerGenerator.logger';


@Injectable()
export default class DataParserHelper {
	private readonly logger: Logger;

	constructor(
		@Inject(forwardRef(() => LoggerGenerator)) // resolve circular dependency
		private readonly loggerGenerator: LoggerGenerator,
	) {
		this.logger = this.loggerGenerator.getLogger();
	}

	public toString(data: unknown): string | null {
		let result = null;

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
			result = JSON.stringify(data) || data?.toString() || '';
			break;
		case 'symbol':
			result = data.toString();
			break;
		default:
			result = '';
			break;
		}

		return result;
	}

	public toObject(data: string): object | string | null {
		let result = data;

		try {
			result = JSON.parse(data);
		} catch (error) {
			this.logger.warn('String:Object parse error');
			return null;
		}

		return result;
	}
}