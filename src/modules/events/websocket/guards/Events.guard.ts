import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { WebSocketEventsEnum } from '@domain/enums/webSocketEvents.enum';
import Exceptions from '@core/errors/Exceptions';
import LoggerService from '@core/logging/Logger.service';
import { getObjKeys, getObjValues } from '@common/utils/dataValidations.util';


@Injectable()
export default class EventsGuard implements CanActivate {
	constructor(
		private readonly exceptions: Exceptions,
		private readonly logger: LoggerService,
	) { }

	public canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		const [socket, message, _, event] = context.getArgs() as [Socket, unknown, unknown, WebSocketEventsEnum];

		const socketId = socket?.id;

		if (socketId)
			this.logger.setSocketId(socketId);

		this.logger.verbose(`Running guard to '${event}' event for '${socketId}' socket`);

		if (!getObjValues<WebSocketEventsEnum>(WebSocketEventsEnum).includes(event) || !getObjKeys(message).length) {
			this.logger.warn(`Invalid event: '${event}' or message`);
			throw new WsException(this.exceptions.internal({
				message: 'Invalid message',
			}));
		}

		return true;
	}
}
