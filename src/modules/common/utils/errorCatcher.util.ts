import {
	HttpException, BadRequestException, ForbiddenException,
	UnauthorizedException, ConflictException, NotFoundException,
	ServiceUnavailableException, InternalServerErrorException
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { AxiosError } from 'axios';
import Exceptions from '@core/errors/Exceptions';
import HttpConstants from '@common/constants/Http.constants';
import { ErrorInterface } from '@shared/interfaces/errorInterface';


type generatedExceptionsType = BadRequestException | ForbiddenException | UnauthorizedException | ThrottlerException | ConflictException | NotFoundException | ServiceUnavailableException | InternalServerErrorException;
type exceptionGeneratorType = (error: ErrorInterface) => generatedExceptionsType;

export default function catchError(error: any): generatedExceptionsType {
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

	if (error instanceof AxiosError) {
		const exception = exceptionSelector(error.status ?? error.response?.status);
		return exception(error);
	} else if (error instanceof HttpException) {
		const exception = exceptionSelector(error.getStatus());
		return exception(error);
	} else if (error instanceof Error) {
		const exception = exceptionSelector(500);
		return exception(error);
	}

	return exceptions.internal({
		message: error?.message,
		details: error?.details,
		cause: error?.cause,
	});
}
