import { Console } from 'console';
import { ArgumentMetadata } from '@nestjs/common';
import { Schema } from 'joi';
import { Logger } from 'winston';
import Exceptions from '@core/errors/Exceptions';
import LoggerService from '@core/logging/Logger.service';


export default class SchemaValidator {
	constructor(
		private readonly exceptions: Exceptions,
		private readonly logger: Logger | LoggerService | Console,
	) { }

	private log(message: string): void {
		if (this.logger instanceof Console)
			this.logger.log(message);
		else
			this.logger.verbose(message);
	}

	public validate<S = unknown>(data: unknown, metadata: ArgumentMetadata, schema: Schema<S>): S {
		this.log(`Validating '${metadata.type}' received as '${metadata.metatype?.name}'`);

		const { value, error } = schema.validate(
			data,
			{ stripUnknown: false },
		);

		if (error) {
			const errorMessages = error.details.map((errorDetail) => errorDetail.message).join(', ');
			throw this.exceptions.contract({
				message: `${error.name}: ${errorMessages}`,
				stack: error.stack,
				details: error.details,
			});
		}

		return value;
	}
}
