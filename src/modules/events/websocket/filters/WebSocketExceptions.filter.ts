import { Catch, ArgumentsHost, WsExceptionFilter, HttpException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AxiosError } from 'axios';
import AppExceptionsFilter, { ErrorOrExceptionToFilter } from '@core/errors/AppExceptions.filter';
import LoggerService from '@core/logging/Logger.service';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';


@Catch(HttpException, WsException, AxiosError, Error)
export class WebSocketExceptionsFilter extends AppExceptionsFilter implements WsExceptionFilter<ErrorOrExceptionToFilter> {
	constructor(
		protected readonly logger: LoggerService,
		protected readonly dataParserHelper: DataParserHelper,
	) {
		super(logger, dataParserHelper);
	}

	public catch(exception: unknown, host: ArgumentsHost): void {
		const context = host.switchToWs();
		const event = context.getPattern();
		const data = context.getData<unknown>();
		const socket = context.getClient<Socket>();

		this.capture(exception);

		const { errorEvent, errorResponse } = this.buildWsErrorResponse(exception, event, data);
		socket.emit(errorEvent, errorResponse);
	}
}
