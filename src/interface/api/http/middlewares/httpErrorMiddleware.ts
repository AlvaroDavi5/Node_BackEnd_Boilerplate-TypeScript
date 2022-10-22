import { Request, Response, NextFunction } from 'express';
import { containerInterface } from 'src/types/_containerInterface';
import { ErrorInterface } from 'src/types/_errorInterface';


/**
@param {Object} ctx - Dependency Injection (container)
@param {import('src/interface/api/http/constants/httpConstants')} ctx.httpConstants
@param {import('src/infra/logging/logger')} ctx.logger
@param {import('configs/staticConfigs')} ctx.configs
**/
export default ({
	httpConstants,
	logger,
	configs,
}: containerInterface) => (error: ErrorInterface, request: Request, response: Response, next: NextFunction) => {
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
