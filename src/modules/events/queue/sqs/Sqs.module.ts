import { DynamicModule, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import SqsService from './Sqs.service';
import { SQS_OPTIONS } from './sqs.constants';
import type { SqsOptions } from './sqs.types';

@Module({})
export default class SqsModule {
	public static register(options: SqsOptions): DynamicModule {
		return {
			module: SqsModule,
			imports: [DiscoveryModule],
			providers: [{ provide: SQS_OPTIONS, useFactory: (): SqsOptions => options }, SqsService],
			exports: [SqsService],
		};
	}
}
