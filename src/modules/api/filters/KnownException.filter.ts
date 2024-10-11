import { Catch, ExceptionFilter, ArgumentsHost, HttpException } from '@nestjs/common';
import { AxiosError } from 'axios';
import { captureError } from '@core/errors/trackers';
import LoggerService from '@core/logging/Logger.service';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import { HttpStatusEnum } from '@common/enums/httpStatus.enum';
import { ExceptionsEnum } from '@common/enums/exceptions.enum';
import externalErrorParser from '@common/utils/externalErrorParser.util';
import { getObjValues, isNullOrUndefined } from '@common/utils/dataValidations.util';
import { ErrorInterface } from '@shared/internal/interfaces/errorInterface';
import { RequestInterface, ResponseInterface } from '@shared/internal/interfaces/endpointInterface';


type ErrorOrException = HttpException | AxiosError | Error;
type errorResponseType = ErrorInterface & { description?: string, timestamp: string };

@Catch(HttpException, AxiosError, Error)
export default class AppExceptionsFilter implements ExceptionFilter<ErrorOrException> {
	private readonly knownExceptions: string[];
	private readonly exceptionsToIgnore: string[];
	private readonly errorsToIgnore: number[];

	constructor(
		private readonly logger: LoggerService,
		private readonly dataParserHelper: DataParserHelper,
	) {
		this.knownExceptions = getObjValues<ExceptionsEnum>(ExceptionsEnum).map((exc) => exc.toString());
		this.errorsToIgnore = [
			HttpStatusEnum.TOO_MANY_REQUESTS,
			HttpStatusEnum.INVALID_TOKEN,
			HttpStatusEnum.I_AM_A_TEAPOT,
		];
		this.exceptionsToIgnore = [
			ExceptionsEnum.TOO_MANY_REQUESTS,
			ExceptionsEnum.INVALID_TOKEN,
			ExceptionsEnum.CONTRACT,
		];
	}

	private capture(exception: unknown): void {
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

	private buildErrorResponse(exception: ErrorOrException): { status: number, errorResponse: errorResponseType } {
		let status: number;
		let errorResponse: errorResponseType = {
			name: exception.name,
			message: exception.message,
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

			errorResponse.description = (error.getResponse() as errorResponseType).description ?? errorResponse.description;
			errorResponse.details = (error.getResponse() as errorResponseType).details ?? errorResponse.details;
			errorResponse.cause = error.cause;
		}

		return { status, errorResponse };
	}

	public catch(exception: ErrorOrException, host: ArgumentsHost): void {
		const context = host.switchToHttp();
		const request = context.getRequest<RequestInterface>();
		const response = context.getResponse<ResponseInterface>();

		if (request.id)
			this.logger.setRequestId(request.id);

		this.capture(exception);
		const { status, errorResponse } = this.buildErrorResponse(exception);

		response.status(status).json(errorResponse);
	}
}
