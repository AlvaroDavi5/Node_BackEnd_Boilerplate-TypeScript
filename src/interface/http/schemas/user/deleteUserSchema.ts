import Joi from 'joi';


export default () =>
	Joi.object().keys({
		params: Joi.object().keys({
			userId: Joi.number().required(),
		}).unknown(false),
	});
