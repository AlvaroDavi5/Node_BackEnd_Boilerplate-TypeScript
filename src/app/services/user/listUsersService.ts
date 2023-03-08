import { ContainerInterface } from 'src/container';
import { messageType } from 'src/types/_messageType';
import { userAuthType } from 'src/types/_userAuthInterface';


export default ({
	userRepository,
}: ContainerInterface) => ({
	execute: async (data: messageType, user?: userAuthType): Promise<any> => {
		const result = userRepository.list(data);
		return result;
	}
});
