import Joi from 'joi';


export default () =>
	Joi.object().keys({
		query: Joi.object().keys({
			size: Joi.number().required(),
			page: Joi.number().default(0),
			limit: Joi.number().default(10),
			order: Joi.string().valid('ASC', 'DESC').default('DESC'),
			sort: Joi.string().valid('createdAt', 'updatedAt').default('createdAt'),
			selectSoftDeleted: Joi.boolean().default(false),
			searchTerm: Joi.string(),
		}),
	});
