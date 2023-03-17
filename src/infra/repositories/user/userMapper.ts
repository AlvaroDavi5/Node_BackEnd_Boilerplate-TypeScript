import UserEntity from 'src/domain/entities/User';


const toEntity = (dataValues: any): UserEntity | object => {
	const userEntity = new UserEntity(dataValues);

	if (!userEntity.validate().valid)
		return {};

	return userEntity;
};

const toDatabase = (entity: UserEntity): any => {
	return {
		id: entity.getId(),
		fullName: entity.fullName,
		email: entity.getEmail(),
		password: entity.getPassword(),
		phone: entity.getPhone(),
		docType: entity.docType,
		document: entity.getDocument(),
		fu: entity.fu,
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
