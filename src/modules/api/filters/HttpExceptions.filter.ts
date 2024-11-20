import { Catch, ArgumentsHost, HttpException, ExceptionFilter } from '@nestjs/common';
import AbstractExceptionsFilter, { ErrorOrExceptionToFilter } from '@core/errors/AbstractExceptions.filter';
import LoggerService from '@core/logging/Logger.service';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import { isNullOrUndefined } from '@common/utils/dataValidations.util';
import externalErrorParser from '@common/utils/externalErrorParser.util';
import { ErrorInterface } from '@shared/internal/interfaces/errorInterface';
import { RequestInterface, ResponseInterface } from '@shared/internal/interfaces/endpointInterface';


type httpErrorResponseType = ErrorInterface & {
	description?: string,
	timestamp: string,
};

@Catch()
export class HttpExceptionsFilter extends AbstractExceptionsFilter implements ExceptionFilter<ErrorOrExceptionToFilter> {
	constructor(
		protected readonly dataParserHelper: DataParserHelper,
		protected readonly logger: LoggerService,
	) {
		super(logger, dataParserHelper);
	}

	private buildHttpErrorResponse(exception: unknown): { status: number, errorResponse: httpErrorResponseType } {
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

	public catch(exception: unknown, host: ArgumentsHost): void {
		const context = host.switchToHttp();
		const request = context.getRequest<RequestInterface>();
		const response = context.getResponse<ResponseInterface>();

		if (request.id)
			this.logger.setRequestId(request.id);

		this.capture(exception);

		const { status, errorResponse } = this.buildHttpErrorResponse(exception);
		response.status(status).json(errorResponse);
	}
}
