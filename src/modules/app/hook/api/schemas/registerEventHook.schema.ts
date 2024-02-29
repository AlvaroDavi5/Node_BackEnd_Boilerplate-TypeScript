import Joi from 'joi';


export interface RegisterEventHookInterface {
	responseEndpoint?: string,
	responseMethod?: string,
	responseSchema?: string,
}

export default Joi.object().keys({
	responseEndpoint: Joi.string(),
	responseMethod: Joi.string(),
	responseSchema: Joi.string(),
}).unknown(true) as Joi.Schema<RegisterEventHookInterface>;
