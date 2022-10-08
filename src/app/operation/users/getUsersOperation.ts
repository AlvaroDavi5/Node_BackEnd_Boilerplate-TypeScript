/**
 @param {Object} ctx - Dependency Injection
 @param {import('src/app/operation/users/getUsersOperation')} ctx.getUsersOperation
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
