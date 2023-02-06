import { ContainerInterface } from 'src/container';
import { messageType } from 'src/types/_messageType';


export default ({
	logger,
}: ContainerInterface) => ({
	execute: (data: messageType) => {
		logger.warn(JSON.stringify(data));
	}
});
