import Joi from 'joi';
import eventsEnum from 'src/domain/enums/eventsEnum';
import { ContainerInterface } from 'src/types/_containerInterface';


/**
@param {Object} ctx - Dependency Injection (container)
**/
export default (ctx: ContainerInterface) =>
	Joi.object().keys({
		id: Joi.string(),
		timestamp: Joi.alternatives().try(Joi.date(), Joi.string()),
		payload: Joi.object({
			event: Joi.string().empty('').valid(...eventsEnum.values()).required(),
		}).unknown(true).required(),
	});
