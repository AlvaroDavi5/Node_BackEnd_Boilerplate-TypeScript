import { NotFound, MakeErrorClass } from 'fejl';
import ExceptionGenerator from './exceptionGenerator';
import { ContainerInterface } from 'src/types/_containerInterface';
import { ErrorInterface } from 'src/types/_errorInterface';
import exceptionsEnum from 'src/domain/enums/exceptionsEnum';


class Business extends MakeErrorClass('Business') { }
class Contract extends MakeErrorClass('Contract') { }
class Integration extends MakeErrorClass('Integration') { }
class Operation extends MakeErrorClass('Operation') { }
class Internal extends MakeErrorClass('Internal') { }

/**
@param {Object} ctx - Dependency Injection (container)
@param {import('src/interface/http/constants/httpConstants')} ctx.httpConstants
**/
export default ({
	httpConstants,
}: ContainerInterface) => ({

	[exceptionsEnum.CONTRACT]: ({ error, errorType, details = [] }: ErrorInterface) => {
		if (!(error instanceof Error))
			error = new Contract(error);

		error.errorType = errorType || exceptionsEnum.CONTRACT;
		error.statusCode = httpConstants.status.BAD_REQUEST;
		error.details = details;

		return error;
	},

	[exceptionsEnum.OPERATION]: (error: any, errorType: string) => {
		if (!(error instanceof Error))
			error = new Operation(error);

		error.errorType = errorType || exceptionsEnum.OPERATION;
		error.statusCode = httpConstants.status.FORBIDDEN;

		return error;
	},

	[exceptionsEnum.BUSINESS]: (error: any, errorType: string) => {
		if (!(error instanceof Error))
			error = new Business(error);

		error.errorType = errorType || exceptionsEnum.BUSINESS;
		error.statusCode = httpConstants.status.FORBIDDEN;

		return error;
	},

	[exceptionsEnum.UNAUTHORIZED]: ({ error, errorType, details = [] }: ErrorInterface) => {
		if (!(error instanceof Error))
			error = new ExceptionGenerator(`${errorType}: ${error?.message}`);

		error.errorType = errorType || exceptionsEnum.UNAUTHORIZED;
		error.statusCode = httpConstants.status.UNAUTHORIZED;
		error.details = details;

		return error;
	},

	[exceptionsEnum.NOT_FOUND]: (error: any, errorType: string) => {
		if (!(error instanceof Error))
			error = new NotFound(error);

		error.errorType = errorType || exceptionsEnum.NOT_FOUND;
		error.statusCode = httpConstants.status.NOT_FOUND;

		return error;
	},

	[exceptionsEnum.INTEGRATION]: (error: any, errorType: string) => {
		if (!(error instanceof Error))
			error = new Integration(error);

		error.errorType = errorType || exceptionsEnum.INTEGRATION;
		error.statusCode = httpConstants.status.FAILED_DEPENDENCY;

		return error;
	},

	[exceptionsEnum.INTERNAL]: (error: any, errorType: string) => {
		if (!(error instanceof Error))
			error = new Internal(error);

		error.errorType = errorType || exceptionsEnum.INTERNAL;
		error.statusCode = httpConstants.status.INTERNAL_SERVER_ERROR;
		return error;
	}
});
