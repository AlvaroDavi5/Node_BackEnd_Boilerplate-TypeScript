import { ContainerInterface } from 'src/types/_containerInterface';
import { userAuthType } from 'src/types/_userAuthInterface';


export default ({
	listUsersService,
	logger,
}: ContainerInterface) => ({
	execute: async (data: any, user?: userAuthType): Promise<any> => {
		if (!user)
			logger.warn('Invalid user!');

		const result = await listUsersService.execute(data);
		return result;
	}
});
