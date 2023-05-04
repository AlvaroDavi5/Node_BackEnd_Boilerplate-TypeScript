import { Op, Includeable } from 'sequelize';
import Users from 'src/infra/database/models/Users';
import UserPreferences from 'src/infra/database/models/UserPreferences';
import themesEnum from 'src/domain/enums/themesEnum';


export const userPreferenceQueryOptions: { include: Includeable[] } = {
	include: [
		{
			model: Users,
			association: UserPreferences.associations.user,
			as: 'user',
		},
	],
};

const _buildWhereParams = ({
	id,
	userId,
	imagePath,
	defaultTheme,
}: any): any => {
	const where: any = {};

	if (id) {
		where.id = id;
		return where;
	}
	else if (userId) {
		where.userId = userId;
		return where;
	}

	if (imagePath) where.imagePath = { [Op.like]: imagePath };

	if (defaultTheme) {
		where[Op.and] = [
			{
				defaultTheme: {
					[Op.in]: themesEnum.values(),
				},
			},
			{ defaultTheme: { [Op.is]: defaultTheme } },
		];
	}

	return where;
};

export const userPreferenceQueryParamsBuilder = ({

	buildParams: (data: any) => {
		const where = _buildWhereParams(data);

		return {
			where,
			subQuery: false,
			distinct: true,
			...userPreferenceQueryOptions,
		};
	}
});
