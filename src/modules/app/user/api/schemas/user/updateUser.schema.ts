import Joi from 'joi';
import { ThemesEnum } from '@domain/enums/themes.enum';
import RegExConstants from '@common/constants/Regex.constants';


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

const regExConstants = new RegExConstants();
const passwordPattern = regExConstants.passwordPattern;

export default Joi.object().keys({
	fullName: Joi.string().trim().max(100),
	password: Joi.string().regex(passwordPattern.regex, { name: passwordPattern.name }).message(passwordPattern.message('password')),
	phone: Joi.string().empty('').max(16).trim(),
	docType: Joi.string().empty('').max(10).trim(),
	document: Joi.string().empty('').max(18).trim(),
	fu: Joi.string().empty('').trim().min(2).max(2),
	imagePath: Joi.string().empty('').max(255).trim(),
	defaultTheme: Joi.string().valid(...Object.values(ThemesEnum)).max(20),
}).unknown(false).required() as Joi.Schema<UpdateUserSchemaInterface>;
