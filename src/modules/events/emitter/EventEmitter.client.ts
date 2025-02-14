import EventEmitter from 'events';
import { Injectable } from '@nestjs/common';
import LoggerService from '@core/logging/Logger.service';


@Injectable()
export default class EventEmitterClient {
	private readonly eventClient: EventEmitter;

	constructor(
		private readonly logger: LoggerService,
	) {
		this.eventClient = new EventEmitter();
	}

	public send(event: string, ...args: unknown[]): boolean {
		return this.eventClient.emit(String(event), ...args);
	}

	public listen(event: string, callback: (...args: unknown[]) => void): void {
		this.logger.info(`Listenning event '${event}' from the Event Emitter`);

		this.eventClient.on(String(event), callback);
	}

	public listenOnce(event: string, callback: (...args: unknown[]) => void): void {
		this.logger.info(`Listenning event '${event}' just one time from the Event Emitter`);

		this.eventClient.once(String(event), callback);
	}

	public ignore(event: string): void {
		this.logger.info(`Ignoring event '${event}' from the Event Emitter`);

		this.eventClient.removeAllListeners(String(event));
	}
}
