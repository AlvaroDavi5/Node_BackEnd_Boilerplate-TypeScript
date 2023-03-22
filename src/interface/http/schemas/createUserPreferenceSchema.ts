import Joi from 'joi';
import themesEnum from 'src/domain/enums/themesEnum';


export default () =>
	Joi.object().keys({
		body: Joi.object().keys({
			imagePath: Joi.string().empty('').trim(),
			defaultTheme: Joi.string().valid(...themesEnum.values()),
		}),
	});
