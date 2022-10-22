import { NotFound, MakeErrorClass } from 'fejl';
import ExceptionGenerator from './exceptionGenerator';
import { ContainerInterface } from 'src/types/_containerInterface';
import { ErrorInterface } from 'src/types/_errorInterface';
import exceptionsEnum from 'src/domain/enums/exceptionsEnum';


class Business extends MakeErrorClass('Business') { }
class Contract extends MakeErrorClass('Contract') { }
class Integration extends MakeErrorClass('Integration') { }
class Operation extends MakeErrorClass('Operation') { }

/**
@param {Object} ctx - Dependency Injection (container)
@param {import('src/interface/api/http/constants/httpConstants')} ctx.httpConstants
**/
export default ({
	httpConstants,
}: ContainerInterface) => ({

	[exceptionsEnum.BUSINESS]: (error: string | any, errorType = exceptionsEnum.BUSINESS) => {
		if (!(error instanceof Error))
			error = new Business(error);

		error.errorType = errorType;
		error.statusCode = httpConstants.status.FORBIDDEN;

		return error;
	},

	[exceptionsEnum.CONTRACT]: (error: string | any, errorType = exceptionsEnum.CONTRACT, details = []) => {
		if (!(error instanceof Error))
			error = new Contract(error);

		error.errorType = errorType;
		error.details = details;
		error.statusCode = httpConstants.status.BAD_REQUEST;

		return error;
	},

	[exceptionsEnum.INTEGRATION]: (error: string | any, errorType = exceptionsEnum.INTEGRATION) => {
		if (!(error instanceof Error))
			error = new Integration(error);

		error.errorType = errorType;
		error.statusCode = httpConstants.status.INTERNAL_SERVER_ERROR;

		return error;
	},

	[exceptionsEnum.OPERATION]: (error: string | any, errorType = exceptionsEnum.OPERATION) => {
		if (!(error instanceof Error))
			error = new Operation(error);

		error.errorType = errorType || exceptionsEnum.OPERATION;
		error.statusCode = 403;
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

	[exceptionsEnum.NOT_FOUND]: (error: string | any, errorType = exceptionsEnum.NOT_FOUND) => {
		if (!(error instanceof Error))
			error = new NotFound(error);

		error.errorType = errorType || exceptionsEnum.NOT_FOUND;
		error.statusCode = httpConstants.status.NOT_FOUND;

		return error;
	}
});
