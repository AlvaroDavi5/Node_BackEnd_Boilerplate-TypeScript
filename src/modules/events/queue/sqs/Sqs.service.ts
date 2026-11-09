import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { Consumer, StopOptions } from 'sqs-consumer';
import { SQS_OPTIONS, SQS_CONSUMER_METHOD, SQS_CONSUMER_EVENT_HANDLER } from './sqs.constants';
import type { SqsOptions, SqsMessageHandlerMeta, SqsConsumerEventHandlerMeta } from './sqs.types';

type HandlerFunction = (...args: unknown[]) => unknown;

interface DiscoveredMethod<M> {
	meta: M;
	handler: HandlerFunction;
}

@Injectable()
export default class SqsService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(SqsService.name, { timestamp: false });
	private readonly consumers = new Map<string, { instance: Consumer; stopOptions: StopOptions }>();

	constructor(
		@Inject(SQS_OPTIONS) private readonly options: SqsOptions,
		private readonly discoveryService: DiscoveryService,
		private readonly metadataScanner: MetadataScanner,
		private readonly reflector: Reflector,
	) {}

	public onModuleInit(): void {
		const globalStopOptions = this.options.globalStopOptions ?? {};
		const messageHandlers = this.discoverMethods<SqsMessageHandlerMeta>(SQS_CONSUMER_METHOD);
		const eventHandlers = this.discoverMethods<SqsConsumerEventHandlerMeta>(SQS_CONSUMER_EVENT_HANDLER);

		for (const { name, stopOptions, ...consumerOptions } of this.options.consumers) {
			if (this.consumers.has(name)) {
				throw new Error(`Consumer already exists: ${name}`);
			}

			const messageHandler = messageHandlers.find(({ meta }) => meta.name === name);
			if (!messageHandler) {
				this.logger.warn(`No metadata found for: ${name}`);
				continue;
			}

			const consumer = Consumer.create({
				...consumerOptions,
				...(messageHandler.meta.batch === true ? { handleMessageBatch: messageHandler.handler } : { handleMessage: messageHandler.handler }),
			} as Parameters<typeof Consumer.create>[0]);

			for (const eventHandler of eventHandlers.filter(({ meta }) => meta.name === name)) {
				consumer.addListener(eventHandler.meta.eventName, eventHandler.handler);
			}

			this.consumers.set(name, { instance: consumer, stopOptions: stopOptions ?? globalStopOptions });
		}

		for (const consumer of this.consumers.values()) {
			consumer.instance.start();
		}
	}

	public onModuleDestroy(): void {
		for (const consumer of this.consumers.values()) {
			consumer.instance.stop(consumer.stopOptions);
		}
	}

	private discoverMethods<M>(metadataKey: symbol): DiscoveredMethod<M>[] {
		const discovered: DiscoveredMethod<M>[] = [];

		for (const { instance } of this.discoveryService.getProviders()) {
			if (!instance || typeof instance !== 'object') continue;

			for (const methodName of this.metadataScanner.getAllMethodNames(Object.getPrototypeOf(instance))) {
				const method = instance[methodName] as HandlerFunction;
				const meta = this.reflector.get<M | undefined>(metadataKey, method);
				if (meta) {
					discovered.push({ meta, handler: method.bind(instance) });
				}
			}
		}

		return discovered;
	}
}
