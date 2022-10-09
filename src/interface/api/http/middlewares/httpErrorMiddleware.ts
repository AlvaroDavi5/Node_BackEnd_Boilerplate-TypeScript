/**
 @param {Object} ctx - Dependency Injection (container)
 @param {import('src/interface/httpServer')} ctx.httpServer
 @param {import('src/infra/logging/logger')} ctx.logger
**/
import { Request, Response, NextFunction } from 'express';
import { containerInterface } from 'src/types/_containerInterface';
import { ErrorInterface } from 'src/types/_errorInterface';


export default ({ logger, configs, httpConstants }: containerInterface) => (error: ErrorInterface, request: Request, response: Response, next: NextFunction) => {
	logger.error(error);
	const hasTrace = configs?.application?.stackErrorVisible;

	const options = hasTrace ? { stack: error.stack } : '';

	const statusCode = error.statusCode || httpConstants.status.INTERNAL_SERVER_ERROR;

	const errorCustom = {
		message: error.message,
		statusCode,
		details: error.details || []
	};
	return error.status(statusCode).json(Object.assign(errorCustom, options));
};
