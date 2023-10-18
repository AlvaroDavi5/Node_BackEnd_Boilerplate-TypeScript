import { Injectable } from '@nestjs/common';
import Joi from 'joi';
import Exceptions from '@infra/errors/Exceptions';


@Injectable()
export default class SchemaValidator<S> {

	constructor(
		private readonly exceptions: Exceptions,
	) { }

	public validate(data: any, schema: Joi.ObjectSchema<S>): S {
		const { value, error } = schema.validate(
			data,
			{ stripUnknown: false },
		);

		if (error) {
			const errorMessages = error.details.map((e) => e.message).join();
			throw this.exceptions.contract({
				message: `${error.name} - ${errorMessages}`,
				stack: error.stack,
			});
		}

		return value;
	}
}
