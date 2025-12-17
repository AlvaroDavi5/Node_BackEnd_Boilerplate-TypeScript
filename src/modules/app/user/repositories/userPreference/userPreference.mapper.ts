import UserPreferencesModel from '@core/infra/database/models/UserPreferences.model';
import UserPreferenceEntity from '@domain/entities/UserPreference.entity';


function toDomainEntity(dataValues: UserPreferencesModel): UserPreferenceEntity {
	return new UserPreferenceEntity(dataValues);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toDatabaseEntity(entity: UserPreferenceEntity): any {
	if (!entity.validate().valid)
		return null;

	const { id: _id, userId, ...preferenceAttributes } = entity.getAttributes();
	const userPreferenceAttributes = {
		...preferenceAttributes,
		user: { id: userId },
	};

	return userPreferenceAttributes;
};

export default {
	toDomainEntity,
	toDatabaseEntity,
};
