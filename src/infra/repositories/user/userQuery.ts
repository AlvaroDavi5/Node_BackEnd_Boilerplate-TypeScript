import { Op, Includeable } from 'sequelize';
import Users from 'src/infra/database/models/Users';
import UserPreferences from 'src/infra/database/models/UserPreferences';
import themesEnum from 'src/domain/enums/themesEnum';


const _buildIncludeParams = (): Includeable[] => {
	const includeParams: Includeable[] = [
		{
			model: UserPreferences,
			association: Users.associations.preference,
			as: 'preference',
		},
	];

	return includeParams;
};

const _buildPaginationParams = ({ size, page, order, sort }: any): any => {
	const paginationParams: any = {};

	if (size !== undefined && page !== undefined) {
		paginationParams.limit = parseInt(size) || 10;
		paginationParams.offset = (parseInt(page) || 0) * size;
	}

	if (sort || order) {
		const listOrder = order || 'DESC';
		const sortOrder = sort || 'createdAt';

		paginationParams.order = [[sortOrder, listOrder]];
	}
	return paginationParams;
};

const _buildWhereParams = ({
	selectSoftDeleted,
	searchTerm,
	id,
	fullName,
	email,
	phone,
	docType,
	document,
	fu,
	preference: { defaultTheme },
}: any): any => {
	const where: any = {};

	if (!selectSoftDeleted) {
		where[Op.and] = [
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

	if (defaultTheme) {
		where[Op.and] = [
			{
				'$preference.defaultTheme$': {
					[Op.in]: themesEnum.values(),
				},
			},
			{ '$preference.defaultTheme$': { [Op.is]: defaultTheme } },
		];
	}

	return where;
};

export const userQueryParamsBuilder = () => ({

	buildParams: (data: any) => {

		const where = _buildWhereParams(data);
		const pagination = _buildPaginationParams(data);
		const include = _buildIncludeParams();

		return {
			...pagination,
			where,
			subQuery: false,
			distinct: true,
			include,
		};
	}
});

export const userQueryOptions: { include: Includeable[] } = {
	include: [
		{
			model: UserPreferences,
			association: Users.associations.preference,
			as: 'preference',
		},
	],
};
