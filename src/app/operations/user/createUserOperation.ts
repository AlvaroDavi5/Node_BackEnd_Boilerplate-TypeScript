import UserEntity from 'src/domain/entities/User';
import UserPreferenceEntity from 'src/domain/entities/UserPreference';
import { ContainerInterface } from 'src/types/_containerInterface';
import { userAuthType } from 'src/types/_userAuthInterface';


export default ({
	createUserService,
	createUserPreferenceService,
	getUserService,
	exceptions,
}: ContainerInterface) => ({
	execute: async (data: any, userAgent?: userAuthType): Promise<any> => {
		if (!userAgent?.username)
			throw exceptions.unauthorized({
				message: 'Invalid userAgent'
			});

		const newUser = new UserEntity(data);
		const createdUser: UserEntity = await createUserService.execute(newUser);

		const newPreference = new UserPreferenceEntity(data);
		newPreference.setUserId(createdUser.getId());
		await createUserPreferenceService.execute(newPreference);

		const result: UserEntity = await getUserService.execute({ id: createdUser.getId() });
		return result;
	}
});
