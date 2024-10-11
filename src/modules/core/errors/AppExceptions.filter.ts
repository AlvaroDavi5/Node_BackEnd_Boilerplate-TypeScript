import { HttpException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { AxiosError } from 'axios';
import { captureError } from '@core/errors/trackers';
import LoggerService from '@core/logging/Logger.service';
import { WebSocketEventsEnum } from '@domain/enums/webSocketEvents.enum';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import { HttpStatusEnum } from '@common/enums/httpStatus.enum';
import { ExceptionsEnum } from '@common/enums/exceptions.enum';
import externalErrorParser from '@common/utils/externalErrorParser.util';
import { getObjValues, isNullOrUndefined } from '@common/utils/dataValidations.util';
import { ErrorInterface } from '@shared/internal/interfaces/errorInterface';


export type ErrorOrExceptionToFilter = HttpException | WsException | AxiosError | Error;
type httpErrorResponseType = ErrorInterface & {
	description?: string,
	timestamp: string,
};
type wsErrorResponseType = ErrorInterface & {
	receivedEvent: string,
	receivedData: unknown,
	timestamp: string,
};

export default abstract class AppExceptionsFilter {
	private readonly knownExceptions: string[];
	private readonly exceptionsToIgnore: string[];
	private readonly errorsToIgnore: number[];

	constructor(
		protected readonly logger: LoggerService,
		protected readonly dataParserHelper: DataParserHelper,
	) {
		this.knownExceptions = getObjValues<ExceptionsEnum>(ExceptionsEnum).map((exc) => exc.toString());

		this.exceptionsToIgnore = [
			ExceptionsEnum.TOO_MANY_REQUESTS,
			ExceptionsEnum.INVALID_TOKEN,
			ExceptionsEnum.CONTRACT,
		];
		this.errorsToIgnore = [
			HttpStatusEnum.TOO_MANY_REQUESTS,
			HttpStatusEnum.INVALID_TOKEN,
			HttpStatusEnum.I_AM_A_TEAPOT,
		];
	}

	protected capture(exception: unknown): void {
		this.logger.error(exception);

		const shouldIgnoreKnownException = exception instanceof HttpException
			&& this.knownExceptions.includes(exception.name)
			&& this.exceptionsToIgnore.includes(exception.name);

		const shouldIgnoreHttpException = exception instanceof HttpException
			&& this.errorsToIgnore.includes(exception.getStatus());

		const shouldIgnoreAxiosError = exception instanceof AxiosError
			&& !!exception.status
			&& this.errorsToIgnore.includes(exception.status);

		if (!shouldIgnoreKnownException && !shouldIgnoreHttpException && !shouldIgnoreAxiosError)
			captureError(exception);
	}

	protected buildHttpErrorResponse(exception: unknown): { status: number, errorResponse: httpErrorResponseType } {
		let status: number;
		let errorResponse: httpErrorResponseType = {
			name: (exception as ErrorOrExceptionToFilter)?.name,
			message: (exception as ErrorOrExceptionToFilter)?.message,
			timestamp: new Date().toISOString(),
		};

		if (exception instanceof HttpException) {
			status = exception.getStatus();
			const exceptionResponse = exception.getResponse();

			if (typeof exceptionResponse === 'object' && !isNullOrUndefined(exceptionResponse)) {
				errorResponse = {
					...exceptionResponse,
					...errorResponse,
				};
			} else {
				const strData = this.dataParserHelper.toString(exceptionResponse);
				errorResponse.details = strData;
			}

			errorResponse.cause = exception.cause;
		} else {
			const error = externalErrorParser(exception);
			status = error.getStatus();

			errorResponse.description = (error.getResponse() as httpErrorResponseType).description ?? errorResponse.description;
			errorResponse.details = (error.getResponse() as httpErrorResponseType).details ?? errorResponse.details;
			errorResponse.cause = error.cause;
		}

		return { status, errorResponse };
	}

	protected buildWsErrorResponse(exception: unknown, event: string, data: unknown): { errorEvent: string, errorResponse: httpErrorResponseType } {
		let errorResponse: wsErrorResponseType = {
			name: (exception as ErrorOrExceptionToFilter)?.name,
			message: (exception as ErrorOrExceptionToFilter)?.message,
			receivedEvent: event,
			receivedData: data,
			timestamp: new Date().toISOString(),
		};

		if (exception instanceof WsException) {
			const error = exception.getError();

			if (typeof error === 'object' && !isNullOrUndefined(error)) {
				errorResponse = {
					...error,
					...errorResponse,
				};
			} else {
				const strData = this.dataParserHelper.toString(error);
				errorResponse.details = strData;
			}
		} else {
			const error = externalErrorParser(exception);

			errorResponse.name = error.name;
			errorResponse.message = error.message;
			errorResponse.code = error.getStatus();
			errorResponse.details = error.cause;
		}

		return { errorEvent: WebSocketEventsEnum.ERROR, errorResponse };
	}
}
