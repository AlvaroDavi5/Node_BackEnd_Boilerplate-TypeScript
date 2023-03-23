import { ContainerInterface } from 'src/container';
import { userAuthType } from 'src/types/_userAuthInterface';


export default ({
	logger,
}: ContainerInterface) => ({
	execute: async (data: any, user?: userAuthType): Promise<any> => {
		logger.warn({ data, user });
	}
});
