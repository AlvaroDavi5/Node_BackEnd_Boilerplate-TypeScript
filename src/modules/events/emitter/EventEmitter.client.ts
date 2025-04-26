import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import LoggerService from '@core/logging/Logger.service';


@Injectable()
export default class EventEmitterClient {
	constructor(
		private readonly eventEmitter: EventEmitter2,
		private readonly logger: LoggerService,
	) { }

	public send(event: string, ...args: unknown[]): boolean {
		return this.eventEmitter.emit(String(event), ...args);
	}

	public listen(event: string, callback: (...args: unknown[]) => void): void {
		this.logger.info(`Listenning event '${event}' from the Event Emitter`);

		this.eventEmitter.on(String(event), callback);
	}

	public listenOnce(event: string, callback: (...args: unknown[]) => void): void {
		this.logger.info(`Listenning event '${event}' just one time from the Event Emitter`);

		this.eventEmitter.once(String(event), callback);
	}

	public ignore(event: string): void {
		this.logger.info(`Ignoring event '${event}' from the Event Emitter`);

		this.eventEmitter.removeAllListeners(String(event));
	}
}
