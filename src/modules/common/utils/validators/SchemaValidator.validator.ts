import { Injectable } from '@nestjs/common';
import { Schema } from 'joi';
import Exceptions from '@core/infra/errors/Exceptions';


@Injectable()
export default class SchemaValidator<S> {

	constructor(
		private readonly exceptions: Exceptions,
	) {
	}

	public validate(data: unknown, schema: Schema<S>): S {
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
