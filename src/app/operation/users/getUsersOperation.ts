/**
 @param {Object} ctx - Dependency Injection
 @param {import('src/app/operation/users/getUsersOperation')} ctx.getUsersOperation
**/
export default ({
	logger,
	appInfo,
}: any) => ({
	execute: (data: any) => {
		logger.warn({ data, appInfo });
	}
});
