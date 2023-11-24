import UserPreferenceEntity from '@app/domain/entities/UserPreference.entity';
import UserPreferencesModel from '@core/infra/database/models/UserPreferences.model';


const toEntity = ({ dataValues }: UserPreferencesModel): UserPreferenceEntity => {
	return new UserPreferenceEntity(dataValues);
};

const toDatabase = (entity: UserPreferenceEntity): any => {
	if (!(entity.validate().valid))
		return null;

	return {
		userId: entity.getUserId(),
		imagePath: entity.getImagePath(),
		defaultTheme: entity.defaultTheme,
		createdAt: entity.createdAt,
		updatedAt: entity.updatedAt,
		deletedAt: entity.deletedAt,
	};
};

export default {
	toEntity,
	toDatabase,
};
