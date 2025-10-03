import { HttpException } from '@nestjs/common';
import { AxiosError } from 'axios';
import Exceptions from '@core/errors/Exceptions';
import { ExceptionsEnum } from '@common/enums/exceptions.enum';
import { HttpStatusEnum } from '@common/enums/httpStatus.enum';
import { ErrorInterface } from '@shared/internal/interfaces/errorInterface';


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

export default function externalErrorParser(error: unknown): HttpException {
	let exceptionName: ExceptionsEnum;
	const errorStacks: string[] = [];

	if (error instanceof HttpException) {
		exceptionName = exceptionsMapper(error.getStatus());
		const res = error.getResponse();
		if (typeof res === 'object') {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const response = res as Record<string, any>;
			const responseMessage = !!response.message ? JSON.stringify(response.message) : undefined;
			const responseMetadata = !!response.metadata
				? JSON.stringify({
					message: response.metadata?.message,
					detail: response.metadata?.detail,
				})
				: undefined;

			if (responseMessage || responseMetadata) {
				if (responseMessage) errorStacks.push(responseMessage);
				if (responseMetadata) errorStacks.push(responseMetadata);
				error.stack = [...errorStacks, error.stack].join('\n');
			}
		}
	} else if (error instanceof AxiosError) {
		exceptionName = exceptionsMapper(error.status ?? 500);
		const { response } = error;
		if (typeof response === 'object') {
			const responseMessage = !!response.data ? JSON.stringify(response.data) : undefined;
			if (responseMessage) {
				if (responseMessage) errorStacks.push(responseMessage);
				error.stack = [...errorStacks, error.stack].join('\n');
			}
		}
	} else { // instanceof Error
		exceptionName = exceptionsMapper(HttpStatusEnum.INTERNAL_SERVER_ERROR);
	}

	const exceptions = new Exceptions();
	return exceptions[String(exceptionName) as ExceptionsEnum](error as ErrorInterface, true);
}
