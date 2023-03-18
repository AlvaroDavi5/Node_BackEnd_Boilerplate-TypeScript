import { Request, Response, NextFunction } from 'express';
import { ErrorInterface } from 'src/types/_errorInterface';
import { ContainerInterface } from 'src/container';


export default ({
	httpConstants,
	logger,
	configs,
}: ContainerInterface) => (error: ErrorInterface, request: Request, response: Response, next: NextFunction) => {
	const errorStackVisible = configs?.application?.stackErrorVisible === 'true';

	logger.error(error);

	const options = errorStackVisible ? { stack: error.stack } : '';
	const statusCode = error?.statusCode || httpConstants.status.INTERNAL_SERVER_ERROR;

	const errorCustom = {
		message: error.message,
		statusCode,
		details: error.details,
	};
	return response.status(statusCode).json(Object.assign(errorCustom, options));
};
