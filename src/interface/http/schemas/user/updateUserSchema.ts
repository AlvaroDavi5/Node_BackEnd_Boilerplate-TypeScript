import Joi from 'joi';
import themesEnum from 'src/domain/enums/themesEnum';


export default () =>
	Joi.object().keys({
		params: Joi.object().keys({
			userId: Joi.number().required(),
		}).unknown(false),
		body: Joi.object().keys({
			password: Joi.string().min(8).max(60),
			fullName: Joi.string().trim().max(100),
			phone: Joi.string().empty('').max(16).trim(),
			docType: Joi.string().empty('').max(10).trim(),
			document: Joi.string().empty('').max(18).trim(),
			fu: Joi.string().empty('').trim().min(2).max(2),
			imagePath: Joi.string().empty('').max(255).trim(),
			defaultTheme: Joi.string().valid(...themesEnum.values()).max(20),
		}).unknown(false),
	});
