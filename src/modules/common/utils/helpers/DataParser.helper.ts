import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Logger } from 'winston';
import LoggerGenerator from '@core/infra/logging/LoggerGenerator.logger';
import { wrapperType } from '@shared/types/constructorType';


@Injectable()
export default class DataParserHelper {
	private readonly logger: Logger;

	constructor(
		@Inject(forwardRef(() => LoggerGenerator)) // ? resolve circular dependency
		private readonly loggerGenerator: wrapperType<LoggerGenerator>, // * wrapperType to transpile in SWC
	) {
		this.logger = this.loggerGenerator.getLogger(true);
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
				result = (JSON.stringify(data) || data?.toString()) ?? '';
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

	public toObject(data: string): object | null {
		try {
			return JSON.parse(data);
		} catch (error) {
			this.logger.warn('String->Object parse error');
			return null;
		}
	}
}
