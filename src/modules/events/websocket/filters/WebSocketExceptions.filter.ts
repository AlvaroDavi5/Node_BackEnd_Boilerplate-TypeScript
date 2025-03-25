import { Catch, ArgumentsHost, WsExceptionFilter } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import LoggerService from '@core/logging/Logger.service';
import { WebSocketEventsEnum } from '@domain/enums/events.enum';
import AbstractExceptionsFilter, { ErrorOrExceptionToFilter } from '@common/filters/AbstractExceptions.filter';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import { isNullOrUndefined } from '@common/utils/dataValidations.util';
import externalErrorParser from '@common/utils/externalErrorParser.util';
import { ErrorInterface } from '@shared/internal/interfaces/errorInterface';


type wsErrorResponseType = ErrorInterface & {
	receivedEvent: string,
	receivedData: unknown,
	timestamp: string,
};

@Catch()
export class WebSocketExceptionsFilter extends AbstractExceptionsFilter implements WsExceptionFilter<ErrorOrExceptionToFilter> {
	constructor(
		protected readonly logger: LoggerService,
		protected readonly dataParserHelper: DataParserHelper,
	) {
		super(logger, dataParserHelper);
	}

	private buildWsErrorResponse(exception: unknown, event: string, data: unknown): {
		errorEvent: string, errorResponse: ErrorInterface & { timestamp: string },
	} {
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

	public catch(exception: unknown, host: ArgumentsHost): void {
		const context = host.switchToWs();
		const event = context.getPattern();
		const data = context.getData<unknown>();
		const socket = context.getClient<Socket>();

		const socketId = socket?.id;

		if (socketId)
			this.logger.setSocketId(socketId);

		this.capture(exception, {
			data: { socketId, event, payload: data },
		});

		const { errorEvent, errorResponse } = this.buildWsErrorResponse(exception, event, data);
		socket.emit(errorEvent, errorResponse);
	}
}
