/**
 @param {Object} ctx - Dependency Injection
 @param {import('src/app/operation/users/getUsersOperation')} ctx.getUsersOperation
**/
import { containerInterface } from 'src/types/_containerInterface';


export default ({
	logger,
	configs,
}: containerInterface) => ({
	execute: (data: object | string) => {
		logger.warn({ data, configs });
	}
});
