import Joi from 'joi';
import { ListQueryInterface } from '@shared/internal/interfaces/listPaginationInterface';


const listQuerySchema: Joi.Schema<ListQueryInterface> = Joi.object({
	limit: Joi.number(),
	page: Joi.number(),
	order: Joi.string().valid('ASC', 'DESC'),
	sortBy: Joi.string().valid('createdAt', 'updatedAt', 'deletedAt'),
	searchTerm: Joi.string(),
	selectSoftDeleted: Joi.boolean(),
}).unknown(true);

export default listQuerySchema;
