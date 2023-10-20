import Joi from 'joi';
import { ThemesEnum } from '@app/domain/enums/themes.enum';


export default Joi.object().keys({
	password: Joi.string().min(8).max(60),
	fullName: Joi.string().trim().max(100),
	phone: Joi.string().empty('').max(16).trim(),
	docType: Joi.string().empty('').max(10).trim(),
	document: Joi.string().empty('').max(18).trim(),
	fu: Joi.string().empty('').trim().min(2).max(2),
	imagePath: Joi.string().empty('').max(255).trim(),
	defaultTheme: Joi.string().valid(...Object.values(ThemesEnum)).max(20),
}).unknown(false);

export interface UpdateUserSchemaInterface {
	password?: string,
	fullName?: string,
	phone?: string,
	docType?: string,
	document?: string,
	fu?: string,
	imagePath?: string,
	defaultTheme?: ThemesEnum,
}
