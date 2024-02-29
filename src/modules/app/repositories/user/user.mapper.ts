import UserEntity, { UserInterface } from '@app/domain/entities/User.entity';
import UsersModel from '@core/infra/database/models/Users.model';
import userPreferenceMapper from '@app/repositories/userPreference/userPreference.mapper';


const toEntity = ({ dataValues }: UsersModel): UserEntity => {
	const preferenceDataValues = {
		dataValues: {
			...dataValues?.preference?.toJSON(),
			userId: dataValues?.id,
		}
	};

	const userPreference = userPreferenceMapper.toEntity(preferenceDataValues as any);
	dataValues.preference = userPreference;

	return new UserEntity(dataValues);
};

const toDatabase = (entity: UserEntity): UserInterface | null => {
	if (!(entity.validate().valid))
		return null;

	const { id, preference, ...userAttributes } = entity.getAttributes();

	return userAttributes;
};

export default {
	toEntity,
	toDatabase,
};
