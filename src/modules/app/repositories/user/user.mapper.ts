import UserEntity from '@app/domain/entities/User.entity';
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

const toDatabase = (entity: UserEntity): any => {
	if (!(entity.validate().valid))
		return null;

	return {
		...entity.getLogin(),
		password: entity.getPassword(),
		phone: entity.getPhone(),
		...entity.getDocInfos(),
		createdAt: entity.createdAt,
		updatedAt: entity.updatedAt,
		deletedAt: entity.deletedAt,
		deletedBy: entity.getDeletedBy(),
	};
};

export default {
	toEntity,
	toDatabase,
};
