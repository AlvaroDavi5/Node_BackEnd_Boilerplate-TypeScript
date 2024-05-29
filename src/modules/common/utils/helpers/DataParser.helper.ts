import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import LoggerService from '@core/logging/Logger.service';
import { dataParserHelperMock } from '@dev/mocks/mockedModules';


@Injectable()
export default class DataParserHelper {
	private readonly logger: LoggerService;

	constructor(
		private readonly configService: ConfigService,
	) {
		this.logger = new LoggerService(DataParserHelper.name, this.configService, dataParserHelperMock as any);
		this.logger.setContextName(DataParserHelper.name);
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
		case 'function':
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
