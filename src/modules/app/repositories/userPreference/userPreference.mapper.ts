import UserPreferenceEntity, { UserPreferenceInterface } from '@app/domain/entities/UserPreference.entity';
import UserPreferencesModel from '@core/infra/database/models/UserPreferences.model';


const toEntity = ({ dataValues }: UserPreferencesModel): UserPreferenceEntity => {
	return new UserPreferenceEntity(dataValues);
};

const toDatabase = (entity: UserPreferenceEntity): UserPreferenceInterface | null => {
	if (!(entity.validate().valid))
		return null;

	const { id, ...userPreferenceAttributes } = entity.getAttributes();

	return userPreferenceAttributes;
};

export default {
	toEntity,
	toDatabase,
};
