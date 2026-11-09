import type { ConsumerOptions, StopOptions } from 'sqs-consumer';

export type SqsConsumerOptions = Omit<ConsumerOptions, 'handleMessage' | 'handleMessageBatch'> & {
	name: string;
	stopOptions?: StopOptions;
};

export interface SqsOptions {
	consumers: SqsConsumerOptions[];
	globalStopOptions?: StopOptions;
}

export interface SqsMessageHandlerMeta {
	name: string;
	batch?: boolean;
}

export interface SqsConsumerEventHandlerMeta {
	name: string;
	eventName: string;
}
