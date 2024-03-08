import { Op, Includeable, FindAndCountOptions, Attributes, WhereOptions, Order } from 'sequelize';
import UsersModel from '@core/infra/database/models/Users.model';
import UserPreferencesModel from '@core/infra/database/models/UserPreferences.model';
import { ThemesEnum } from '@domain/enums/themes.enum';
import { UserInterface } from '@domain/entities/User.entity';
import { ListQueryInterface } from '@shared/interfaces/listPaginationInterface';


export const userQueryOptions: { include: Includeable[] } = {
	include: [
		{
			model: UserPreferencesModel,
			association: UsersModel.associations.preference,
			as: 'preference',
		},
	],
};

interface PaginationOptionsInterface {
	limit?: number,
	offset?: number,
	order?: Order,
}

const _buildPaginationParams = ({ limit, page, order, sortBy }: ListQueryInterface): PaginationOptionsInterface => {
	const paginationParams: PaginationOptionsInterface = {};

	if (limit && page) {
		paginationParams.limit = Number(limit) || 10; // max results
		paginationParams.offset = (Number(page) || 0) * paginationParams.limit; // start from
	}

	if (sortBy || order) {
		const listOrder = order ?? 'ASC';
		const sortOrder = sortBy ?? 'createdAt';

		paginationParams.order = [[sortOrder, listOrder]];
	}

	return paginationParams;
};

const _buildWhereParams = ({
	searchTerm,
	selectSoftDeleted,
	id,
	fullName,
	email,
	phone,
	docType,
	document,
	fu,
	preference,
}: ListQueryInterface & UserInterface): WhereOptions => {
	const where: WhereOptions = {};

	if (selectSoftDeleted === true) {
		where[Op.or as any] = [
			{ deletedAt: { [Op.not]: null } },
			{ deletedBy: { [Op.not]: null } },
		];
	}

	if (id) {
		where.id = id;
		return where;
	}

	if (document) where.document = document;
	if (docType) where.docType = docType;
	if (fu) where.fu = fu;
	if (phone) where.phone = phone;

	if (searchTerm) where.fullName = { [Op.substring]: searchTerm };
	if (fullName) where.fullName = { [Op.eq]: fullName };
	if (email) where.email = { [Op.like]: email };

	if (preference?.defaultTheme) {
		where[Op.and as any] = [
			{
				'$preference.defaultTheme$': {
					[Op.in]: Object.values(ThemesEnum),
				},
			},
			{ '$preference.defaultTheme$': { [Op.is]: preference.defaultTheme } },
		];
	}

	return where;
};

export const userQueryParamsBuilder = ({

	buildParams: (data: any): Omit<FindAndCountOptions<Attributes<UsersModel>>, 'group'> => {
		const where = _buildWhereParams(data);
		const pagination = _buildPaginationParams(data);

		return {
			...pagination,
			where,
			subQuery: false,
			distinct: true,
			...userQueryOptions,
		};
	}
});
