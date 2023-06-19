import UserEntity from '@modules/app/domain/entities/User';
import userPreferenceMapper from '../userPreference/userPreferenceMapper';


const toEntity = ({ dataValues }: any): UserEntity => {
	const preference = {
		...dataValues?.preference?.toJSON(),
		userId: dataValues?.id,
	};

	const userPreference = userPreferenceMapper.toEntity({ dataValues: preference });
	dataValues.preference = userPreference;

	const user = new UserEntity(dataValues);
	return user;
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
