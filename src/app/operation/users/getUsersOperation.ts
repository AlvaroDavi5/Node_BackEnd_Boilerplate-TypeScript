/**
 @param {Object} ctx - Dependency Injection
 @param {import('src/app/operation/users/getUsersOperation')} ctx.getUsersOperation
**/
import { containerType } from 'src/types/_containerType';

export default ({
	logger,
	appInfo,
}: containerType) => ({
	execute: (data: object | string) => {
		logger.warn({ data, appInfo });
	}
});
