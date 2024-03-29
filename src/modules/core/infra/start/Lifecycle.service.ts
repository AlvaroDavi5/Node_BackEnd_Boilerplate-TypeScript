import { Injectable, Inject, OnModuleInit, OnApplicationBootstrap, OnModuleDestroy, BeforeApplicationShutdown, OnApplicationShutdown } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Sequelize } from 'sequelize';
import { Logger } from 'winston';
import WebSocketServer from '@events/websocket/server/WebSocket.server';
import MongoClient from '@core/infra/data/Mongo.client';
import RedisClient from '@core/infra/cache/Redis.client';
import CognitoClient from '@core/infra/integration/aws/Cognito.client';
import SnsClient from '@core/infra/integration/aws/Sns.client';
import SqsClient from '@core/infra/integration/aws/Sqs.client';
import S3Client from '@core/infra/integration/aws/S3.client';
import SyncCronJob from '@core/infra/cron/jobs/SyncCron.job';
import { DATABASE_CONNECTION_PROVIDER } from '@core/infra/database/connection';
import LoggerGenerator from '@core/infra/logging/LoggerGenerator.logger';
import { ConfigsInterface } from '@core/configs/configs.config';
import { EnvironmentsEnum } from '@common/enums/environments.enum';
import { ProcessExitStatusEnum } from '@common/enums/processEvents.enum';


@Injectable()
export default class LifecycleService implements OnModuleInit, OnApplicationBootstrap, OnModuleDestroy, BeforeApplicationShutdown, OnApplicationShutdown {
	private readonly logger: Logger;
	private readonly appConfigs: ConfigsInterface['application'];
	private readonly uploadBucket: string;

	constructor(
		private readonly httpAdapterHost: HttpAdapterHost,
		private readonly configService: ConfigService,
		@Inject(DATABASE_CONNECTION_PROVIDER)
		private readonly connection: Sequelize,
		private readonly mongoClient: MongoClient,
		private readonly redisClient: RedisClient,
		private readonly cognitoClient: CognitoClient,
		private readonly snsClient: SnsClient,
		private readonly sqsClient: SqsClient,
		private readonly s3Client: S3Client,
		private readonly webSocketServer: WebSocketServer,
		private readonly syncCronJob: SyncCronJob,
		private readonly loggerGenerator: LoggerGenerator,
	) {
		this.logger = this.loggerGenerator.getLogger();
		this.appConfigs = this.configService.get<any>('application');
		this.uploadBucket = this.configService.get<any>('integration.aws.s3.bucketName');
	}

	public async onModuleInit(): Promise<void> {
		const bucketList = await this.s3Client.listBuckets();

		if (!bucketList.includes(this.uploadBucket))
			try {
				this.s3Client.createBucket(this.uploadBucket);
			} catch (error) {
				this.logger.error(error);
			}

		this.logger.debug('Builded host module');
	}

	public onApplicationBootstrap(): void {
		this.logger.debug(`\n\n\tApp started with PID: ${process.pid} on URL: ${this.appConfigs.url}\n`);
	}

	public onModuleDestroy(): void {
		this.logger.warn('Closing HTTP server, disconnecting websocket clients, stopping crons and destroying cloud integrations');
		try {
			this.httpAdapterHost.httpAdapter.close();
			this.webSocketServer.disconnectAllSockets();
			this.webSocketServer.disconnect();
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
			await this.connection.close();
		} catch (error) {
			this.logger.error(error);
		}
	}

	public onApplicationShutdown(): void {
		this.logger.warn('Exiting Application');
		if (this.appConfigs.environment !== EnvironmentsEnum.TEST)
			process.exit(ProcessExitStatusEnum.SUCCESS);
	}
}
