import { Injectable, Inject, OnModuleInit, OnApplicationBootstrap, OnModuleDestroy, BeforeApplicationShutdown, OnApplicationShutdown } from '@nestjs/common';
import { HttpAdapterHost, ModuleRef } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import MongoClient from '@core/infra/data/Mongo.client';
import RedisClient from '@core/infra/cache/Redis.client';
import CognitoClient from '@core/infra/integration/aws/Cognito.client';
import SnsClient from '@core/infra/integration/aws/Sns.client';
import SqsClient from '@core/infra/integration/aws/Sqs.client';
import S3Client from '@core/infra/integration/aws/S3.client';
import SyncCronJob from '@core/cron/jobs/SyncCron.job';
import { DATABASE_CONNECTION_PROVIDER } from '@core/infra/database/connection';
import LoggerService from '@core/logging/Logger.service';
import { ConfigsInterface } from '@core/configs/envs.config';
import { EmitterEventsEnum } from '@domain/enums/events.enum';
import WebSocketServer from '@events/websocket/server/WebSocket.server';
import EventEmitterClient from '@events/emitter/EventEmitter.client';
import { EnvironmentsEnum } from '@common/enums/environments.enum';
import { ProcessExitStatusEnum } from '@common/enums/processEvents.enum';


@Injectable()
export default class LifecycleService implements OnModuleInit, OnApplicationBootstrap, OnModuleDestroy, BeforeApplicationShutdown, OnApplicationShutdown {
	private readonly appConfigs: ConfigsInterface['application'];
	private eventEmitterClient: EventEmitterClient;

	constructor(
		private readonly moduleRef: ModuleRef,
		private readonly httpAdapterHost: HttpAdapterHost<ExpressAdapter>,
		private readonly configService: ConfigService,
		@Inject(DATABASE_CONNECTION_PROVIDER) private readonly connection: DataSource,
		private readonly mongoClient: MongoClient,
		private readonly redisClient: RedisClient,
		private readonly cognitoClient: CognitoClient,
		private readonly snsClient: SnsClient,
		private readonly sqsClient: SqsClient,
		private readonly s3Client: S3Client,
		private readonly webSocketServer: WebSocketServer,
		private readonly syncCronJob: SyncCronJob,
		private readonly logger: LoggerService,
	) {
		this.eventEmitterClient = this.moduleRef.get(EventEmitterClient, { strict: false });
		this.appConfigs = this.configService.get<ConfigsInterface['application']>('application')!;
	}

	public onModuleInit(): void {
		this.logger.debug('Builded host module');
	}

	public onApplicationBootstrap(): void {
		this.logger.verbose(`\tApp started with PID: ${process.pid} on URL: ${this.appConfigs.url}`);

		this.eventEmitterClient.listen(EmitterEventsEnum.DISABLE_ALL_ROUTES, (disabled: unknown, data: unknown) => {
			if (typeof disabled === 'boolean' && disabled === true) {
				// NOTE - circuit breaker
				this.logger.warn(`Closing HTTP server due '${EmitterEventsEnum.DISABLE_ALL_ROUTES}' event, received data:`, data);
				this.httpAdapterHost?.httpAdapter?.close();
			}
		});
	}

	public onModuleDestroy(): void {
		this.logger.warn('Closing HTTP server, disconnecting websocket clients, stopping crons and destroying cloud integrations');
		try {
			// NOTE - gracefull shutdown
			this.httpAdapterHost?.httpAdapter?.close();
			this.webSocketServer.disconnectAllSockets();
			this.webSocketServer.disconnect();
			this.syncCronJob.stopCron();
			this.cognitoClient.destroy();
			this.sqsClient.destroy();
			this.snsClient.destroy();
			this.s3Client.destroy();
		} catch (error) {
			this.logger.error(error);
		}
	}

	public async beforeApplicationShutdown(): Promise<void> {
		this.logger.warn('Closing cache and databases connections');
		if (this.redisClient.isConnected() === true)
			try {
				await this.redisClient.disconnect();
			} catch (error) {
				this.logger.error(error);
			}

		if (this.mongoClient.isConnected === true)
			try {
				await this.mongoClient.disconnect();
			} catch (error) {
				this.logger.error(error);
			}

		try {
			await this.connection.destroy();
		} catch (error) {
			this.logger.error(error);
		}
	}

	public onApplicationShutdown(): void {
		this.logger.warn('Exiting Application');

		const shouldExit = this.appConfigs.environment !== EnvironmentsEnum.TEST;
		if (shouldExit)
			process.exit(ProcessExitStatusEnum.SUCCESS);
	}
}
