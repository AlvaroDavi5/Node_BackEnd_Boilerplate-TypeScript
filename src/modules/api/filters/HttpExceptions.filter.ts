import { Catch, ArgumentsHost, HttpException, ExceptionFilter } from '@nestjs/common';
import LoggerService from '@core/logging/Logger.service';
import AbstractExceptionsFilter, { ErrorOrExceptionToFilter } from '@common/filters/AbstractExceptions.filter';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import { isNullOrUndefined } from '@common/utils/dataValidations.util';
import externalErrorParser from '@common/utils/externalErrorParser.util';
import { TimeZonesEnum } from '@common/enums/timeZones.enum';
import { getDateTimeNow, fromDateTimeToISO } from '@common/utils/dates.util';
import { ErrorInterface } from '@shared/internal/interfaces/errorInterface';
import { RequestInterface, ResponseInterface } from '@shared/internal/interfaces/endpointInterface';


type httpErrorResponseType = ErrorInterface & {
	error: string,
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
		const excep = exception as ErrorOrExceptionToFilter & { response: Record<string, string> };
		let errorResponse: httpErrorResponseType = {
			error: excep.name,
			name: excep?.response?.error ?? excep.name,
			message: excep?.response?.message ?? excep.message,
			timestamp: fromDateTimeToISO(getDateTimeNow(TimeZonesEnum.America_SaoPaulo), true),
		};

		let status: number;
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

		const requestId = request?.id;
		const clientIp = request?.socket?.remoteAddress;

		if (requestId)
			this.logger.setRequestId(requestId);
		if (clientIp)
			this.logger.setClientIp(clientIp);

		this.capture(exception, {
			data: { requestId },
			user: {
				ip_address: clientIp,
				username: request.user?.username as string,
				id: request.user?.clientId as string,
			}
		});

		const { status, errorResponse } = this.buildHttpErrorResponse(exception);
		response.status(status).json(errorResponse);
	}
}
