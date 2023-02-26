import Joi from 'joi';
import eventsEnum from 'src/domain/enums/eventsEnum';


export default () =>
	Joi.object().keys({
		id: Joi.string(),
		timestamp: Joi.alternatives().try(Joi.date(), Joi.string()),
		payload: Joi.object({
			event: Joi.string().empty('').valid(...eventsEnum.values()).required(),
		}).unknown(true).required(),
	});
