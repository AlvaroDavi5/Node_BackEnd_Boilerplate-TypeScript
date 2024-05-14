import { ArgumentMetadata } from '@nestjs/common';
import { Schema } from 'joi';
import { Logger } from 'winston';
import Exceptions from '@core/errors/Exceptions';
import { LoggerInterface } from '@core/logging/logger';


export default class SchemaValidator<S> {
	constructor(
		private readonly exceptions: Exceptions,
		private readonly logger: Logger | LoggerInterface | Console,
	) { }

	public validate(data: unknown, metadata: ArgumentMetadata, schema: Schema<S>): S {
		this.logger.debug(`Validating '${metadata.type}' received as '${metadata.metatype?.name}'`);

		const { value, error } = schema.validate(
			data,
			{ stripUnknown: false },
		);

		if (error) {
			const errorMessages = error.details.map((e) => e.message).join(', ');
			throw this.exceptions.contract({
				message: `${error.name}: ${errorMessages}`,
				stack: error.stack,
				details: error.details,
			});
		}

		return value;
	}
}
