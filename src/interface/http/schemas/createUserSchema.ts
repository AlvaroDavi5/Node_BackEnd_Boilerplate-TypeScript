import Joi from 'joi';
import themesEnum from 'src/domain/enums/themesEnum';


export default () =>
	Joi.object().keys({
		body: Joi.object().keys({
			fullName: Joi.string().empty('').trim(),
			email: Joi.string().email(),
			password: Joi.string().empty('').trim().min(8),
			phone: Joi.string().empty('').trim(),
			docType: Joi.string().empty('').trim(),
			document: Joi.string().empty('').trim(),
			fu: Joi.string().empty('').trim().min(2),
			imagePath: Joi.string().empty('').trim(),
			defaultTheme: Joi.string().valid(...themesEnum.values()),
		}),
	});
