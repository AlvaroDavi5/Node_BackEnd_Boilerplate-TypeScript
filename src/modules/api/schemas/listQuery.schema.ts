import Joi from 'joi';


export default Joi.object().keys({
	size: Joi.number(),
	page: Joi.number(),
	limit: Joi.number(),
	order: Joi.string().valid('ASC', 'DESC'),
	sort: Joi.string().valid('createdAt', 'updatedAt', 'deletedAt'),
	selectSoftDeleted: Joi.boolean(),
	searchTerm: Joi.string(),
}).unknown(true);
