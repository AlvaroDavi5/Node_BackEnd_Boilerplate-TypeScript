import { ContainerInterface } from 'src/container';
import { messageType } from 'src/types/_messageType';
import { userAuthType } from 'src/types/_userAuthInterface';


export default ({
	logger,
}: ContainerInterface) => ({
	execute: async (data: messageType, user?: userAuthType): Promise<any> => {
		logger.warn({ data, user });
	}
});
