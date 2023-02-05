import { ContainerInterface } from 'src/container';
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
