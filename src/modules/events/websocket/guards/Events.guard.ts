import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { Socket as ServerSocket } from 'socket.io';
import { WebSocketEventsEnum } from '@app/domain/enums/webSocketEvents.enum';
import Exceptions from '@core/infra/errors/Exceptions';


@Injectable()
export default class EventsGuard implements CanActivate {
	private readonly exceptions: Exceptions;

	constructor() {
		this.exceptions = new Exceptions();
	}

	public canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		const socket = context.getArgs()[0] as ServerSocket;
		const message = context.getArgs()[1] as any;
		const event = context.getArgs()[3] as WebSocketEventsEnum;

		console.log(`Running guard '${EventsGuard.name}' to '${event}' event for '${socket.id}' socket`);

		if (!Object.values(WebSocketEventsEnum).includes(event) || !Object.keys(message).length) {
			socket.disconnect(true);
			throw new WsException(this.exceptions.internal({
				message: 'Invalid message',
			}));
		}

		return true;
	}
}
