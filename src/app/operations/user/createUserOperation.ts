import { ContainerInterface } from 'src/types/_containerInterface';
import { userAuthType } from 'src/types/_userAuthInterface';


export default ({
	logger,
}: ContainerInterface) => ({
	execute: async (data: any, user?: userAuthType): Promise<any> => {
		logger.warn({ data, user });
	}
});
