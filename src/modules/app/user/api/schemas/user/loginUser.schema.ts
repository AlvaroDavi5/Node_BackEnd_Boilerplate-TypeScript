import Joi from 'joi';
import RegExConstants from '@common/constants/Regex.constants';


export interface LoginUserSchemaInterface {
	email: string,
	password: string,
}

const regExConstants = new RegExConstants();
const passwordPattern = regExConstants.passwordPattern;

const loginUserSchema: Joi.Schema<LoginUserSchemaInterface> = Joi.object({
	email: Joi.string().email().max(70).required(),
	password: Joi.string().regex(passwordPattern.regex, { name: passwordPattern.name }).message(passwordPattern.message('password')).required(),
}).strict(true).required();

export default loginUserSchema;
