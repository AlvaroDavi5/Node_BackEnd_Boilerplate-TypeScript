import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { Logger } from 'winston';
import Exceptions from '@core/errors/Exceptions';
import { generateLogger } from '@core/logging/logger';


type dateInputType = (string | Date) | (() => string | Date) | undefined | null

export class ParseDatePipe implements PipeTransform<dateInputType, Date> {
	private readonly exceptions: Exceptions;
	private readonly logger: Logger;

	constructor() {
		this.exceptions = new Exceptions();
		this.logger = generateLogger(ParseDatePipe.name);
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
