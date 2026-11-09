import { SetMetadata } from '@nestjs/common';
import { SQS_CONSUMER_METHOD, SQS_CONSUMER_EVENT_HANDLER } from './sqs.constants';
import type { SqsMessageHandlerMeta, SqsConsumerEventHandlerMeta } from './sqs.types';

export const SqsMessageHandler = (name: string, batch?: boolean) => SetMetadata<symbol, SqsMessageHandlerMeta>(SQS_CONSUMER_METHOD, { name, batch });

export const SqsConsumerEventHandler = (name: string, eventName: string) =>
	SetMetadata<symbol, SqsConsumerEventHandlerMeta>(SQS_CONSUMER_EVENT_HANDLER, { name, eventName });
