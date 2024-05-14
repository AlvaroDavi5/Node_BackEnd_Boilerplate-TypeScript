import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { LOGGER_PROVIDER, LoggerProviderInterface } from '@core/logging/Logger.provider';
import { LoggerInterface } from '@core/logging/logger';


@Injectable()
export default class DataParserHelper {
	private readonly logger: LoggerInterface;

	constructor(
		@Inject(forwardRef(() => LOGGER_PROVIDER)) // ? resolve circular dependency
		private readonly loggerProvider: LoggerProviderInterface,
	) {
		this.logger = this.loggerProvider.getLogger(DataParserHelper.name);
	}

	public toString(data: unknown): string {
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
			if (!data)
				result = '';
			else
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
