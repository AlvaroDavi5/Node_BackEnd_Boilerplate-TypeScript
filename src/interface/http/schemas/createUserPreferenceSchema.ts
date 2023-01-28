import Joi from 'joi';
import themesEnum from 'src/domain/enums/themesEnum';
import { ContainerInterface } from 'src/types/_containerInterface';


/**
@param {Object} ctx - Dependency Injection (container)
**/
export default (ctx: ContainerInterface) =>
	Joi.object().keys({
		body: Joi.object().keys({
			imagePath: Joi.string().empty('').trim(),
			defaultTheme: Joi.number().valid(...themesEnum.values()),
		}),
	});
