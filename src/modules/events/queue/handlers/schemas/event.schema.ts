import Joi from 'joi';
import { EventsEnum } from '@domain/enums/events.enum';


export interface EventSchemaInterface {
	id: number | string,
	schema?: string,
	schemaVersion?: number,
	payload: {
		event: EventsEnum,
		[key: string]: any,
	},
	source?: string,
	timestamp: Date | string,
}

export default Joi.object().keys({
	id: Joi.alternatives().try(Joi.number(), Joi.string()),
	timestamp: Joi.alternatives().try(Joi.date(), Joi.string()),
	payload: Joi.object({
		event: Joi.string().valid(...Object.values(EventsEnum)).required(),
	}).unknown(true).required(),
}).unknown(true).required() as Joi.Schema<EventSchemaInterface>;
