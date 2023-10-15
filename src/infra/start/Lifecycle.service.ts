import { Injectable, OnModuleInit, OnApplicationBootstrap, OnModuleDestroy, BeforeApplicationShutdown, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { Logger } from 'winston';
import { ConfigsInterface } from '@configs/configs.config';
import WebSocketServer from '@modules/events/websocket/server/WebSocket.server';
import SyncCronJob from '@infra/cron/jobs/SyncCron.job';
import MongoClient from '@infra/data/Mongo.client';
import RedisClient from '@infra/cache/Redis.client';
import CognitoClient from '@infra/integration/aws/Cognito.client';
import SnsClient from '@infra/integration/aws/Sns.client';
import SqsClient from '@infra/integration/aws/Sqs.client';
import S3Client from '@infra/integration/aws/S3.client';
import connection from '@infra/database/connection';
import LoggerGenerator from '@infra/logging/LoggerGenerator.logger';
import { ProcessExitStatusEnum } from './processEvents.enum';


@Injectable()
export default class LifecycleService implements OnModuleInit, OnApplicationBootstrap, OnModuleDestroy, BeforeApplicationShutdown, OnApplicationShutdown {
	private readonly logger: Logger;
	private readonly appConfigs: ConfigsInterface['application'];

	constructor(
		private readonly configService: ConfigService,
		private readonly httpAdapterHost: HttpAdapterHost,
		private readonly webSocketServer: WebSocketServer,
		private readonly syncCronJob: SyncCronJob,
		private readonly mongoClient: MongoClient,
		private readonly redisClient: RedisClient,
		private readonly cognitoClient: CognitoClient,
		private readonly snsClient: SnsClient,
		private readonly sqsClient: SqsClient,
		private readonly s3Client: S3Client,
		private readonly loggerGenerator: LoggerGenerator,
	) {
		this.logger = this.loggerGenerator.getLogger();
		this.appConfigs = this.configService.get<any>('application');
	}

	public onModuleInit(): void {
		this.logger.debug('Builded host module');
	}

	public onApplicationBootstrap(): void {
		this.logger.debug(`\n\n\tApp started with PID: ${process.pid} on URL: ${this.appConfigs?.url}\n`);
	}

	public onModuleDestroy(): void {
		this.logger.warn('Closing HTTP server, disconnecting websocket clients, stopping crons and destroying cloud integrations');
		try {
			this.httpAdapterHost.httpAdapter.close();
			this.webSocketServer.disconnectAllSockets();
			this.syncCronJob.stopCron();
			this.cognitoClient.destroy();
			this.snsClient.destroy();
			this.sqsClient.destroy();
			this.s3Client.destroy();
		} catch (error) {
			this.logger.error(error);
		}
	}

	public async beforeApplicationShutdown(): Promise<void> {
		this.logger.warn('Closing cache and database connections');
		if (this.redisClient.isConnected === true)
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
			await connection.close();
		} catch (error) {
			this.logger.error(error);
		}
	}

	public onApplicationShutdown(): void {
		this.logger.warn('Exiting Application');
		process.exit(ProcessExitStatusEnum.SUCCESS);
	}
}
