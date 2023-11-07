import { Op, Includeable } from 'sequelize';
import UsersModel from '@core/infra/database/models/Users.model';
import UserPreferencesModel from '@core/infra/database/models/UserPreferences.model';
import { ThemesEnum } from '@app/domain/enums/themes.enum';


export const userPreferenceQueryOptions: { include: Includeable[] } = {
	include: [
		{
			model: UsersModel,
			association: UserPreferencesModel.associations.user,
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
					[Op.in]: Object.values(ThemesEnum),
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
