import UserPreferenceEntity from '@modules/app/domain/entities/UserPreference';


const toEntity = ({ dataValues }: any): UserPreferenceEntity => {
	const userPreference = new UserPreferenceEntity(dataValues);
	return userPreference;
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
