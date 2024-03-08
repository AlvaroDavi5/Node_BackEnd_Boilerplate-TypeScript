import Joi from 'joi';
import { ThemesEnum } from '@domain/enums/themes.enum';
import RegExConstants from '@common/constants/Regex.constants';


export interface CreateUserSchemaInterface {
	fullName: string,
	email: string,
	password: string,
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
	fullName: Joi.string().trim().max(100).required(),
	email: Joi.string().email().max(70).required(),
	password: Joi.string().regex(passwordPattern.regex, { name: passwordPattern.name }).message(passwordPattern.message('password')).required(),
	phone: Joi.string().empty('').max(16).trim(),
	docType: Joi.string().empty('').max(10).trim(),
	document: Joi.string().empty('').max(18).trim(),
	fu: Joi.string().empty('').trim().min(2).max(2),
	imagePath: Joi.string().empty('').max(255).trim(),
	defaultTheme: Joi.string().valid(...Object.values(ThemesEnum)).default(ThemesEnum.DEFAULT).max(20),
}).unknown(false).required() as Joi.Schema<CreateUserSchemaInterface>;
