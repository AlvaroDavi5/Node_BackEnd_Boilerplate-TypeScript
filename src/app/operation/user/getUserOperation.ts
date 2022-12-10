import { ContainerInterface } from 'src/types/_containerInterface';
import { messageType } from 'src/types/_messageType';


/**
@param {Object} ctx - Dependency Injection (container)
@param {import('src/infra/logging/logger')} ctx.logger
**/
export default ({
	logger,
}: ContainerInterface) => ({
	execute: (data: messageType) => {
		logger.warn(JSON.stringify(data));
	}
});