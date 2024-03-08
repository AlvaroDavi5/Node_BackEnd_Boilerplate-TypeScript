import Joi from 'joi';
import { HttpMethodsEnum } from '@common/enums/httpMethods.enum';


export interface RegisterEventHookInterface {
	responseEndpoint: string,
	responseMethod: HttpMethodsEnum,
	responseSchema: string,
}

export default Joi.object().keys({
	responseEndpoint: Joi.string(),
	responseMethod: Joi.string().valid(...Object.values(HttpMethodsEnum)).default(HttpMethodsEnum.GET),
	responseSchema: Joi.string(),
}).unknown(true) as Joi.Schema<RegisterEventHookInterface>;
