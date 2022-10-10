/**
 @param {Object} ctx - Dependency Injection (container)
 @param {import('src/infra/logging/logger')} ctx.logger
**/
import { containerInterface } from 'src/types/_containerInterface';
import { messageType } from 'src/types/_messageType';


export default ({
	logger,
}: containerInterface) => ({
	execute: (data: messageType) => {
		logger.warn(JSON.stringify(data));
	}
});
