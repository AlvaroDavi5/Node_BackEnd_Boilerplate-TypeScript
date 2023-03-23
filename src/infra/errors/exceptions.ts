import ExceptionGenerator from './exceptionGenerator';
import exceptionsEnum from 'src/domain/enums/exceptionsEnum';
import { ContainerInterface } from 'src/container';
import { ErrorInterface } from 'src/types/_errorInterface';


export interface ExceptionInterface {
	[key: string]: (msg: ErrorInterface) => ExceptionGenerator,
}

export default ({
	httpConstants,
}: ContainerInterface) => ({

	[exceptionsEnum.CONTRACT]: (msg: ErrorInterface) => {
		const exception = new ExceptionGenerator(msg.message);

		exception.setName('Contract');
		exception.setCode(httpConstants.status.BAD_REQUEST);
		exception.setErrorType(exceptionsEnum.CONTRACT);
		exception.setStack(msg.stack);
		exception.setDetails(msg.details);

		return exception;
	},

	[exceptionsEnum.OPERATION]: (msg: ErrorInterface) => {
		const exception = new ExceptionGenerator(msg.message);

		exception.setName('Operation');
		exception.setCode(httpConstants.status.FAILED_DEPENDENCY);
		exception.setErrorType(exceptionsEnum.OPERATION);
		exception.setStack(msg.stack);
		exception.setDetails(msg.details);

		return exception;
	},

	[exceptionsEnum.BUSINESS]: (msg: ErrorInterface) => {
		const exception = new ExceptionGenerator(msg.message);

		exception.setName('Business');
		exception.setCode(httpConstants.status.FORBIDDEN);
		exception.setErrorType(exceptionsEnum.BUSINESS);
		exception.setStack(msg.stack);
		exception.setDetails(msg.details);

		return exception;
	},

	[exceptionsEnum.UNAUTHORIZED]: (msg: ErrorInterface) => {
		const exception = new ExceptionGenerator(msg.message);

		exception.setName('Unauthorized');
		exception.setCode(httpConstants.status.UNAUTHORIZED);
		exception.setErrorType(exceptionsEnum.UNAUTHORIZED);
		exception.setStack(msg.stack);
		exception.setDetails(msg.details);

		return exception;
	},

	[exceptionsEnum.NOT_FOUND]: (msg: ErrorInterface) => {
		const exception = new ExceptionGenerator(msg.message);

		exception.setName('Not Found');
		exception.setCode(httpConstants.status.NOT_FOUND);
		exception.setErrorType(exceptionsEnum.NOT_FOUND);
		exception.setStack(msg.stack);
		exception.setDetails(msg.details);

		return exception;
	},

	[exceptionsEnum.INTEGRATION]: (msg: ErrorInterface) => {
		const exception = new ExceptionGenerator(msg.message);

		exception.setName('Integration');
		exception.setCode(httpConstants.status.SERVICE_UNAVAILABLE);
		exception.setErrorType(exceptionsEnum.INTEGRATION);
		exception.setStack(msg.stack);
		exception.setDetails(msg.details);

		return exception;
	},

	[exceptionsEnum.INTERNAL]: (msg: ErrorInterface) => {
		const exception = new ExceptionGenerator(msg.message);

		exception.setName('Internal');
		exception.setCode(httpConstants.status.SERVICE_UNAVAILABLE);
		exception.setErrorType(exceptionsEnum.INTERNAL);
		exception.setStack(msg.stack);
		exception.setDetails(msg.details);

		return exception;
	},
});
