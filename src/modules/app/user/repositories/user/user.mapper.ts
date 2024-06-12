import UserEntity from '@domain/entities/User.entity';
import UsersModel from '@core/infra/database/models/Users.model';
import userPreferenceMapper from '@app/user/repositories/userPreference/userPreference.mapper';


const toDomainEntity = (dataValues: UsersModel): UserEntity => {
	const user = new UserEntity(dataValues);

	if (!user.getPreference()) {
		const preferenceDataValues = {
			...(dataValues?.preference ?? {}),
			userId: dataValues?.id,
		};

		const userPreference = userPreferenceMapper.toDomainEntity(preferenceDataValues as any);
		user.setPreference(userPreference);
	}

	return user;
};

const toDatabaseEntity = (entity: UserEntity): any => {
	if (!(entity.validate().valid))
		return null;

	const { id, preference, ...userAttributes } = entity.getAttributes();

	return userAttributes;
};

export default {
	toDomainEntity,
	toDatabaseEntity,
};
