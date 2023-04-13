import UserEntity from 'src/domain/entities/User';
import UserPreferenceEntity from 'src/domain/entities/UserPreference';
import { ContainerInterface } from 'src/types/_containerInterface';
import { userAuthType } from 'src/types/_userAuthInterface';


export default ({
	getUserService,
	deleteUserService,
	getUserPreferenceService,
	deleteUserPreferenceService,
	exceptions,
}: ContainerInterface) => ({
	execute: async (id: number, userAgent?: userAuthType): Promise<any> => {
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

		await deleteUserPreferenceService.execute({
			id: preference.getId(),
			softDelete: true,
		});
		const updatedUser: UserEntity = await deleteUserService.execute({
			id: user.getId(),
			softDelete: true,
			userAgentId: userAgent.username,
		});

		return updatedUser;
	}
});
