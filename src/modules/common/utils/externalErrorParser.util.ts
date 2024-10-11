import { HttpException } from '@nestjs/common';
import { AxiosError } from 'axios';
import Exceptions from '@core/errors/Exceptions';
import { ExceptionsEnum } from '@common/enums/exceptions.enum';
import { HttpStatusEnum } from '@common/enums/httpStatus.enum';


function exceptionsMapper(statusCode: number) {
	const mapper: Record<number, ExceptionsEnum> = {
		[HttpStatusEnum.BAD_REQUEST]: ExceptionsEnum.CONTRACT,
		[HttpStatusEnum.FORBIDDEN]: ExceptionsEnum.BUSINESS,
		[HttpStatusEnum.INVALID_TOKEN]: ExceptionsEnum.INVALID_TOKEN,
		[HttpStatusEnum.UNAUTHORIZED]: ExceptionsEnum.UNAUTHORIZED,
		[HttpStatusEnum.TOO_MANY_REQUESTS]: ExceptionsEnum.TOO_MANY_REQUESTS,
		[HttpStatusEnum.CONFLICT]: ExceptionsEnum.CONFLICT,
		[HttpStatusEnum.NOT_FOUND]: ExceptionsEnum.NOT_FOUND,
		[HttpStatusEnum.SERVICE_UNAVAILABLE]: ExceptionsEnum.INTEGRATION,
		[HttpStatusEnum.INTERNAL_SERVER_ERROR]: ExceptionsEnum.INTERNAL,
	};

	return mapper[Number(statusCode)] ?? ExceptionsEnum.INTERNAL;
}

export default function externalErrorParser(error: any): HttpException {

	const exceptions = new Exceptions();
	let exceptionName: ExceptionsEnum;

	if (error instanceof HttpException)
		exceptionName = exceptionsMapper(error.getStatus());
	else if (error instanceof AxiosError)
		exceptionName = exceptionsMapper(error.status ?? error.response?.status ?? 500);
	else // instanceof Error
		exceptionName = exceptionsMapper(500);

	return exceptions[String(exceptionName) as ExceptionsEnum](error, true);
}
