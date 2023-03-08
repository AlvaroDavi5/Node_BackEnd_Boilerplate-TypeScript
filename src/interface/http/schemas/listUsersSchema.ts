import Joi from 'joi';


export default () =>
	Joi.object().keys({
		query: Joi.object().keys({
			size: Joi.number().default(50),
			page: Joi.number().default(0),
			limit: Joi.number().default(10),
		}),
	});
