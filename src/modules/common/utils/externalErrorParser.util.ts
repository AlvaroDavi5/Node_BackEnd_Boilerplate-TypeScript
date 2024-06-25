import { HttpException } from '@nestjs/common';
import { AxiosError } from 'axios';
import Exceptions from '@core/errors/Exceptions';
import HttpConstants from '@common/constants/Http.constants';
import { ErrorInterface } from '@shared/internal/interfaces/errorInterface';


type exceptionGeneratorType = (error: ErrorInterface) => HttpException;

export default function externalErrorParser(error: any): HttpException {
	const exceptions = new Exceptions();
	const { status } = new HttpConstants();

	const exceptionSelector = (statusCode: number | undefined): exceptionGeneratorType => {
		let exceptionGenerator: exceptionGeneratorType;

		switch (statusCode) {
		case status.BAD_REQUEST:
			exceptionGenerator = exceptions.contract;
			break;
		case status.FORBIDDEN:
			exceptionGenerator = exceptions.business;
			break;
		case status.INVALID_TOKEN:
			exceptionGenerator = exceptions.invalidToken;
			break;
		case status.UNAUTHORIZED:
			exceptionGenerator = exceptions.unauthorized;
			break;
		case status.TOO_MANY_REQUESTS:
			exceptionGenerator = exceptions.manyRequests;
			break;
		case status.CONFLICT:
			exceptionGenerator = exceptions.conflict;
			break;
		case status.NOT_FOUND:
			exceptionGenerator = exceptions.notFound;
			break;
		case status.SERVICE_UNAVAILABLE:
			exceptionGenerator = exceptions.integration;
			break;
		default:
			exceptionGenerator = exceptions.internal;
			break;
		}

		return exceptionGenerator;
	};

	let exception: exceptionGeneratorType;
	if (error instanceof AxiosError)
		exception = exceptionSelector(error.status ?? error.response?.status);
	else if (error instanceof HttpException)
		exception = exceptionSelector(error.getStatus());
	else if (error instanceof Error)
		exception = exceptionSelector(500);
	else {
		exception = () => exceptions.internal({
			message: error?.message,
			details: error?.details,
			cause: error?.cause,
		});
	}

	return exception(error);
}
