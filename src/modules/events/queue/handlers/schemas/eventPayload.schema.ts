import Joi from 'joi';
import { QueueSchemasEnum } from '@domain/enums/events.enum';


export interface EventPayloadInterface {
	id: number | string,
	schema: QueueSchemasEnum,
	schemaVersion: number,
	payload: {
		event: string,
		[key: string]: unknown,
	},
	source: string,
	timestamp: Date | string,
}

const eventPayloadSchema: Joi.Schema<EventPayloadInterface> = Joi.object({
	id: Joi.alternatives().try(Joi.number(), Joi.string()),
	schema: Joi.string().valid(...Object.values(QueueSchemasEnum)).required(),
	schemaVersion: Joi.number(),
	payload: Joi.object({
		event: Joi.string().required(),
	}).unknown(true).required(),
	source: Joi.string(),
	timestamp: Joi.alternatives().try(Joi.date(), Joi.string()),
}).unknown(true).required();

export default eventPayloadSchema;
