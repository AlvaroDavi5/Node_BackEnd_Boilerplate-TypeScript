import UserEntity from 'src/domain/entities/User';
import UserPreferenceEntity from 'src/domain/entities/UserPreference';
import { ContainerInterface } from 'src/types/_containerInterface';
import { userAuthType } from 'src/types/_userAuthInterface';


export default ({
	updateUserService,
	updateUserPreferenceService,
	getUserService,
	getUserPreferenceService,
	exceptions,
}: ContainerInterface) => ({
	execute: async (id: number, data: any, userAgent?: userAuthType): Promise<any> => {
		if (!userAgent?.username)
			throw exceptions.unauthorized({
				message: 'Invalid userAgent'
			});

		const user: UserEntity = await getUserService.execute({ id });
		const preference: UserPreferenceEntity = await getUserPreferenceService.execute({ userId: id });

		if (!user || !preference)
			throw exceptions.operation({
				message: 'User or preference not found!'
			});

		const updatedPreference = await updateUserPreferenceService.execute({
			...data,
			id: preference.getId(),
		});
		const updatedUser: UserEntity = await updateUserService.execute({
			...data,
			id: user.getId(),
		});

		updatedUser.setPreference(updatedPreference);
		return updatedUser;
	}
});
