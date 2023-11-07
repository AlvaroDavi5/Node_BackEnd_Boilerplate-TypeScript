import { Op, Includeable } from 'sequelize';
import UsersModel from '@core/infra/database/models/Users.model';
import UserPreferencesModel from '@core/infra/database/models/UserPreferences.model';
import { ThemesEnum } from '@app/domain/enums/themes.enum';


export const userQueryOptions: { include: Includeable[] } = {
	include: [
		{
			model: UserPreferencesModel,
			association: UsersModel.associations.preference,
			as: 'preference',
		},
	],
};

const _buildPaginationParams = ({ size, page, order, sort }: any): any => {
	const paginationParams: any = {};

	if (size !== undefined && page !== undefined) {
		paginationParams.limit = parseInt(size) || 10;
		paginationParams.offset = (parseInt(page) || 0) * paginationParams.limit;
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
	preference,
}: any): any => {
	const where: any = {};

	if (selectSoftDeleted === true) {
		where[Op.or] = [
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
		where[Op.and] = [
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

	buildParams: (data: any) => {
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
