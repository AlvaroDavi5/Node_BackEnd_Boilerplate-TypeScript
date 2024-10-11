import { Catch, ArgumentsHost, ExceptionFilter, HttpException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { AxiosError } from 'axios';
import AppExceptionsFilter, { ErrorOrExceptionToFilter } from '@core/errors/AppExceptions.filter';
import LoggerService from '@core/logging/Logger.service';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import { RequestInterface, ResponseInterface } from '@shared/internal/interfaces/endpointInterface';


@Catch(HttpException, WsException, AxiosError, Error)
export class HttpExceptionsFilter extends AppExceptionsFilter implements ExceptionFilter<ErrorOrExceptionToFilter> {
	constructor(
		protected readonly logger: LoggerService,
		protected readonly dataParserHelper: DataParserHelper,
	) {
		super(logger, dataParserHelper);
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
