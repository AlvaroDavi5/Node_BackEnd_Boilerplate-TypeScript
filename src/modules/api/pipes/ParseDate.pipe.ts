import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Exceptions from '@core/errors/Exceptions';
import LoggerService from '@core/logging/Logger.service';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import { configServiceMock, dataParserHelperMock } from '@dev/mocks/mockedModules';


type dateInputType = (string | Date) | (() => string | Date) | undefined | null

export default class ParseDatePipe implements PipeTransform<dateInputType, Date> {
	private readonly exceptions: Exceptions;
	private readonly logger: LoggerService;

	constructor() {
		this.exceptions = new Exceptions();
		this.logger = new LoggerService(ParseDatePipe.name, configServiceMock as ConfigService, dataParserHelperMock as DataParserHelper);
	}

	public transform(value: dateInputType, metadata: ArgumentMetadata): Date {
		this.logger.verbose(`Validating '${metadata.type}' received as '${metadata.metatype?.name}'`);

		if (!value)
			throw this.exceptions.contract({
				message: 'Date is required',
			});
		if (typeof value === 'function')
			value = value();

		const transformedValue: Date = new Date(value);
		if (isNaN(transformedValue.getTime())) {
			throw this.exceptions.contract({
				message: 'Invalid date',
			});
		}

		return transformedValue;
	}
}
