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


type errorResponseType = ErrorInterface & { description?: string };

@Catch(HttpException, AxiosError, Error)
export default class KnownExceptionFilter implements ExceptionFilter<HttpException | AxiosError | Error> {
	private readonly knownExceptions: string[];
	private readonly errorsToIgnore: number[];

	constructor(
		private readonly logger: LoggerService,
		private readonly dataParserHelper: DataParserHelper,
	) {
		this.knownExceptions = getObjValues<ExceptionsEnum>(ExceptionsEnum).map((exc) => exc.toString());
		this.errorsToIgnore = [
			HttpStatusEnum.I_AM_A_TEAPOT,
			HttpStatusEnum.INVALID_TOKEN,
			HttpStatusEnum.TOO_MANY_REQUESTS,
		];
	}

	private capture(exception: unknown): void {
		this.logger.error(exception);

		const shouldIgnoreHttpException = exception instanceof HttpException && this.errorsToIgnore.includes(exception.getStatus());
		const shouldIgnoreAxiosError = exception instanceof AxiosError && !!exception.status && this.errorsToIgnore.includes(exception.status);

		if (!shouldIgnoreHttpException && !shouldIgnoreAxiosError)
			captureError(exception);
	}

	private buildErrorResponse(exception: HttpException | AxiosError | Error): { status: number, errorResponse: errorResponseType } {
		let status: number;
		let errorResponse: errorResponseType = {
			name: exception.name,
			message: exception.message,
		};

		if (exception instanceof HttpException) {
			status = exception.getStatus();
			const exceptionResponse = exception.getResponse();

			if (this.knownExceptions.includes(exception.name)) {
				if (typeof exceptionResponse === 'object' && !isNullOrUndefined(exceptionResponse)) {
					const { description, details } = exceptionResponse as errorResponseType;
					errorResponse.description = description;
					errorResponse.details = details;
				} else {
					const strData = this.dataParserHelper.toString(exceptionResponse);
					errorResponse.details = strData;
				}
			} else {
				errorResponse = exceptionResponse as errorResponseType;
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

	public catch(exception: HttpException | AxiosError | Error, host: ArgumentsHost) {
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
