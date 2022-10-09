/**
 @param {Object} ctx - Dependency Injection (container)
 @param {import('src/domain/enums/exceptionsEnum')} ctx.exceptionsEnum
 @param {import('src/interface/api/http/constants/httpConstants')} ctx.httpConstants
**/
import ExceptionGenerator from './exceptionGenerator';
import { containerInterface } from 'src/types/_containerInterface';
import { ErrorInterface } from 'src/types/_errorInterface';


export default ({ exceptionsEnum, httpConstants }: containerInterface) => ({
	[exceptionsEnum.BUSINESS]: ({ error, errorType = exceptionsEnum.BUSINESS, details = [] }: ErrorInterface) => {
		if (!(error instanceof Error))
			error = new ExceptionGenerator(`${errorType}: ${error?.message}`);

		error.errorType = errorType;
		error.details = details;
		error.statusCode = httpConstants.status.FORBIDDEN;

		return error;
	},

	[exceptionsEnum.CONTRACT]: ({ error, errorType = exceptionsEnum.CONTRACT, details = [] }: ErrorInterface) => {
		if (!(error instanceof Error))
			error = new ExceptionGenerator(`${errorType}: ${error?.message}`);

		error.errorType = errorType;
		error.details = details;
		error.statusCode = httpConstants.status.BAD_REQUEST;

		return error;
	},

	[exceptionsEnum.INTEGRATION]: ({ error, errorType = exceptionsEnum.INTEGRATION, details = [] }: ErrorInterface) => {
		if (!(error instanceof Error))
			error = new ExceptionGenerator(`${errorType}: ${error?.message}`);

		error.errorType = errorType;
		error.details = details;
		error.statusCode = httpConstants.status.INTERNAL_SERVER_ERROR;

		return error;
	},

	[exceptionsEnum.OPERATION]: ({ error, errorType = exceptionsEnum.OPERATION, details = [] }: ErrorInterface) => {
		if (!(error instanceof Error))
			error = new ExceptionGenerator(`${errorType}: ${error?.message}`);

		error.errorType = errorType;
		error.details = details;
		error.statusCode = 500;

		return error;
	},

	[exceptionsEnum.NOT_FOUND]: ({ error, errorType = exceptionsEnum.NOT_FOUND, details = [] }: ErrorInterface) => {
		if (!(error instanceof Error))
			error = new ExceptionGenerator(`${errorType}: ${error?.message}`);

		error.errorType = errorType;
		error.details = details;
		error.statusCode = httpConstants.status.NOT_FOUND;

		return error;
	},

	[exceptionsEnum.UNAUTHORIZED]: ({ error, errorType = exceptionsEnum.UNAUTHORIZED, details = [] }: ErrorInterface) => {
		if (!(error instanceof Error))
			error = new ExceptionGenerator(`${errorType}: ${error?.message}`);

		error.errorType = errorType;
		error.details = details;
		error.statusCode = httpConstants.status.UNAUTHORIZED;

		return error;
	},
});
