import { Equal, Like, In, And, FindManyOptions, FindOptionsWhere, FindOptionsSelect } from 'typeorm';
import UserPreferencesModel from '@core/infra/database/models/UserPreferences.model';
import { BuildParamsInterface } from '@core/infra/database/repositories/AbstractRepository.repository';
import { ThemesEnum } from '@domain/enums/themes.enum';
import { UserPreferenceInterface } from '@domain/entities/UserPreference.entity';
import { getObjValues } from '@common/utils/dataValidations.util';


export type UserPreferenceBuildParamsInterface = BuildParamsInterface<UserPreferenceInterface>;

const buildSelectParams = (): FindOptionsSelect<UserPreferencesModel> => {
	const select: FindOptionsSelect<UserPreferencesModel> = {
		id: true,
		defaultTheme: true, imagePath: true,
		createdAt: true, updatedAt: true,
		deletedAt: true,
	};

	return select;
};

const buildWhereParams = ({
	id,
	userId,
	imagePath,
	defaultTheme,
}: UserPreferenceBuildParamsInterface): FindOptionsWhere<UserPreferencesModel> => {
	const where: FindOptionsWhere<UserPreferencesModel> = {};

	if (id) {
		where.id = id;
		return where;
	} else if (userId) {
		where.user = { id: userId };
		return where;
	}

	if (imagePath) where.imagePath = Like(`${imagePath}`);

	if (defaultTheme) {
		where.defaultTheme = And(In(getObjValues<ThemesEnum>(ThemesEnum)), Equal(defaultTheme));
	}

	return where;
};

export const userPreferenceQueryParamsBuilder = {

	buildParams: (data: UserPreferenceBuildParamsInterface): FindManyOptions<UserPreferencesModel> => {
		const select = buildSelectParams();
		const where = buildWhereParams(data);

		return {
			select,
			where,
			relations: { user: true },
		};
	}
};
