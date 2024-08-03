import { Injectable, Inject, CanActivate, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { Socket as ServerSocket } from 'socket.io';
import { WebSocketEventsEnum } from '@domain/enums/webSocketEvents.enum';
import Exceptions from '@core/errors/Exceptions';
import LoggerService, { SINGLETON_LOGGER_PROVIDER, LoggerProviderInterface } from '@core/logging/Logger.service';
import { getObjKeys, getObjValues } from '@common/utils/dataValidations.util';


@Injectable()
export default class EventsGuard implements CanActivate {
	private readonly logger: LoggerService;

	constructor(
		private readonly exceptions: Exceptions,
		@Inject(SINGLETON_LOGGER_PROVIDER)
		private readonly loggerProvider: LoggerProviderInterface,
	) {
		this.logger = this.loggerProvider.getLogger(EventsGuard.name);
	}

	public canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		const socket = context.getArgs()[0] as ServerSocket;
		const message = context.getArgs()[1] as unknown;
		const event = context.getArgs()[3] as WebSocketEventsEnum;

		this.logger.verbose(`Running guard to '${event}' event for '${socket.id}' socket`);

		if (!getObjValues<WebSocketEventsEnum>(WebSocketEventsEnum).includes(event) || !getObjKeys(message).length) {
			this.logger.warn(`Invalid event: '${event}' or message, disconnecting socket`);
			socket.disconnect(true);
			throw new WsException(this.exceptions.internal({
				message: 'Invalid message',
			}));
		}

		return true;
	}
}
