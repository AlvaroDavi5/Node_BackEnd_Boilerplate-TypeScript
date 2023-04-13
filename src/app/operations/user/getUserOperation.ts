import UserEntity from 'src/domain/entities/User';
import UserPreferenceEntity from 'src/domain/entities/UserPreference';
import { ContainerInterface } from 'src/types/_containerInterface';
import { userAuthType } from 'src/types/_userAuthInterface';


export default ({
	getUserService,
	getUserPreferenceService,
	exceptions,
}: ContainerInterface) => ({
	execute: async (id: number, userAgent?: userAuthType): Promise<any> => {
		if (!userAgent?.username)
			throw exceptions.unauthorized({
				message: 'Invalid userAgent'
			});

		const foundedUser: UserEntity = await getUserService.execute({ id });
		const foundedPreference: UserPreferenceEntity = await getUserPreferenceService.execute({ userId: id });

		if (!foundedUser)
			throw exceptions.operation({
				message: 'User not found!'
			});

		foundedUser.setPreference(foundedPreference);
		return foundedUser;
	}
});
