import Joi from 'joi';
import { UpdateUserInterface } from '@domain/entities/User.entity';
import { UpdateUserPreferenceInterface } from '@domain/entities/UserPreference.entity';
import { ThemesEnum } from '@domain/enums/themes.enum';
import RegExConstants from '@common/constants/Regex.constants';


const regExConstants = new RegExConstants();
const passwordPattern = regExConstants.passwordPattern;

const preference = Joi.object().keys({
	imagePath: Joi.string().empty('').max(255).trim(),
	defaultTheme: Joi.string().valid(...Object.values(ThemesEnum)).max(20),
}).unknown(false) as Joi.Schema<UpdateUserPreferenceInterface>;

export default Joi.object().keys({
	fullName: Joi.string().trim().max(100),
	email: Joi.string().email().max(70),
	password: Joi.string().regex(passwordPattern.regex, { name: passwordPattern.name }).message(passwordPattern.message('password')),
	phone: Joi.string().empty('').max(16).trim(),
	docType: Joi.string().empty('').max(10).trim(),
	document: Joi.string().empty('').max(18).trim(),
	fu: Joi.string().empty('').trim().min(2).max(2),
	preference,
}).unknown(false).required() as Joi.Schema<UpdateUserInterface>;
