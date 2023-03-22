import UserEntity from 'src/domain/entities/User';


const toEntity = (dataValues: any): UserEntity | object => {
	const userEntity = new UserEntity(dataValues);

	if (!(userEntity.validate().valid))
		return {};

	return userEntity;
};

const toDatabase = (entity: UserEntity): any => {
	if (!(entity.validate().valid))
	return null;

	return {
		id: entity.getId(),
		...entity.getLogin(),
		password: entity.getPassword(),
		phone: entity.getPhone(),
		...entity.getDocInfos(),
		preference: entity.preference,
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
