import Joi from 'joi';
import { ListQueryInterface } from '@shared/interfaces/listPaginationInterface';


export default Joi.object().keys({
	limit: Joi.number(),
	page: Joi.number(),
	order: Joi.string().valid('ASC', 'DESC'),
	sortBy: Joi.string().valid('createdAt', 'updatedAt', 'deletedAt'),
	searchTerm: Joi.string(),
	selectSoftDeleted: Joi.boolean(),
}).unknown(true) as Joi.Schema<ListQueryInterface>;
