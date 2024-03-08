import { Op, Includeable, FindAndCountOptions, Attributes, WhereOptions } from 'sequelize';
import UsersModel from '@core/infra/database/models/Users.model';
import UserPreferencesModel from '@core/infra/database/models/UserPreferences.model';
import { ThemesEnum } from '@domain/enums/themes.enum';
import { UserPreferenceInterface } from '@domain/entities/UserPreference.entity';


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
}: UserPreferenceInterface): WhereOptions => {
	const where: WhereOptions = {};

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
		where[Op.and as any] = [
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

	buildParams: (data: any): Omit<FindAndCountOptions<Attributes<UsersModel>>, 'group'> => {
		const where = _buildWhereParams(data);

		return {
			where,
			subQuery: false,
			distinct: true,
			...userPreferenceQueryOptions,
		};
	}
});
