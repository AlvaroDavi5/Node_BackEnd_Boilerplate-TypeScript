import Joi from 'joi';
import { ThemesEnum } from '@domain/enums/themes.enum';
import RegExConstants from '@common/constants/Regex.constants';


export interface UserPreferenceSchemaInterface {
	imagePath?: string,
	defaultTheme?: ThemesEnum,
}

export interface UpdateUserSchemaInterface {
	fullName?: string,
	password?: string,
	phone?: string,
	docType?: string,
	document?: string,
	fu?: string,
	preference?: UserPreferenceSchemaInterface,
}

const regExConstants = new RegExConstants();
const passwordPattern = regExConstants.passwordPattern;

const preference = Joi.object().keys({
	imagePath: Joi.string().empty('').max(255).trim(),
	defaultTheme: Joi.string().valid(...Object.values(ThemesEnum)).max(20),
}).unknown(false) as Joi.Schema<UserPreferenceSchemaInterface>;

export default Joi.object().keys({
	fullName: Joi.string().trim().max(100),
	password: Joi.string().regex(passwordPattern.regex, { name: passwordPattern.name }).message(passwordPattern.message('password')),
	phone: Joi.string().empty('').max(16).trim(),
	docType: Joi.string().empty('').max(10).trim(),
	document: Joi.string().empty('').max(18).trim(),
	fu: Joi.string().empty('').trim().min(2).max(2),
	preference,
}).unknown(false).required() as Joi.Schema<UpdateUserSchemaInterface>;
