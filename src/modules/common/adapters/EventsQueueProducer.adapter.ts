import { Injectable } from '@nestjs/common';
import EventsQueueProducer from '@events/queue/producers/EventsQueue.producer';


@Injectable()
export default class EventsQueueProducerAdapter {
	constructor(
		private readonly eventsQueueProducer: EventsQueueProducer,
	) { }

	public getProvider(): EventsQueueProducer {
		return this.eventsQueueProducer;
	}
}
