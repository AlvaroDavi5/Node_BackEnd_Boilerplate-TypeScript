import Joi from 'joi';
import RegExConstants from '@common/constants/Regex.constants';


export interface LoginUserSchemaInterface {
	email: string,
	password: string,
}

const regExConstants = new RegExConstants();
const passwordPattern = regExConstants.passwordPattern;

export default Joi.object().keys({
	email: Joi.string().email().max(70).required(),
	password: Joi.string().regex(passwordPattern.regex, { name: passwordPattern.name }).message(passwordPattern.message('password')).required(),
}).unknown(false).required() as Joi.Schema<LoginUserSchemaInterface>;
