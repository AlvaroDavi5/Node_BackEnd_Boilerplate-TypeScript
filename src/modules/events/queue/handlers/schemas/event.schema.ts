import Joi from 'joi';
import { EventsEnum } from '@modules/app/domain/enums/events.enum';


export default Joi.object().keys({
	id: Joi.alternatives().try(Joi.number(), Joi.string()),
	timestamp: Joi.alternatives().try(Joi.date(), Joi.string()),
	payload: Joi.object({
		event: Joi.string().valid(...Object.values(EventsEnum)).required(),
	}).unknown(true).required(),
});

export interface EventSchemaInterface {
	id?: number | string,
	timestamp?: Date | string,
	payload: {
		event: EventsEnum,
		[key: string]: any,
	},
}
