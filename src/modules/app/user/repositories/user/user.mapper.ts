import UserEntity from '@domain/entities/User.entity';
import UsersModel from '@core/infra/database/models/Users.model';
import UserPreferencesModel from '@core/infra/database/models/UserPreferences.model';
import userPreferenceMapper from '@app/user/repositories/userPreference/userPreference.mapper';


const toDomainEntity = (dataValues: UsersModel): UserEntity => {
	const user = new UserEntity(dataValues);

	if (!user.getPreference()) {
		const preferenceDataValues = {
			...(dataValues?.preference ?? {}),
			userId: dataValues?.id,
		};

		const userPreference = userPreferenceMapper.toDomainEntity(preferenceDataValues as unknown as UserPreferencesModel);
		user.setPreference(userPreference);
	}

	return user;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toDatabaseEntity = (entity: UserEntity): any => {
	if (!(entity.validate().valid))
		return null;

	const { id: _id, preference: _preference, ...userAttributes } = entity.getAttributes();

	return userAttributes;
};

export default {
	toDomainEntity,
	toDatabaseEntity,
};
