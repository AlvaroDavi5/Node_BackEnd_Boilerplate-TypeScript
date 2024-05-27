import { Equal, Like, In, And, FindManyOptions, FindOptionsWhere } from 'typeorm';
import UserPreferencesModel from '@core/infra/database/models/UserPreferences.model';
import { ThemesEnum } from '@domain/enums/themes.enum';
import { UserPreferenceInterface } from '@domain/entities/UserPreference.entity';


const buildWhereParams = ({
	id,
	userId,
	imagePath,
	defaultTheme,
}: UserPreferenceInterface): FindOptionsWhere<UserPreferencesModel> => {
	const where: FindOptionsWhere<UserPreferencesModel> = {};

	if (id) {
		where.id = id;
		return where;
	}
	else if (userId) {
		where.user = { id: userId };
		return where;
	}

	if (imagePath) where.imagePath = Like(`${imagePath}`);

	if (defaultTheme) {
		where.defaultTheme = And(In(Object.values(ThemesEnum)), Equal(defaultTheme));
	}

	return where;
};

export const userPreferenceQueryParamsBuilder = ({

	buildParams: (data: any): FindManyOptions<UserPreferencesModel> => {
		const where = buildWhereParams(data);

		return {
			where,
			relations: [
				'user',
			],
		};
	}
});
