import { Injectable, OnModuleInit, OnApplicationBootstrap, OnModuleDestroy, BeforeApplicationShutdown, OnApplicationShutdown } from '@nestjs/common';
import { Logger } from 'winston';
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


@Injectable()
export default class LifecycleService implements OnModuleInit, OnApplicationBootstrap, OnModuleDestroy, BeforeApplicationShutdown, OnApplicationShutdown {
	private readonly logger: Logger;

	constructor(
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
	}

	public onModuleInit(): void {
		this.logger.debug('Builded host module');
	}

	public onApplicationBootstrap(): void {
		this.logger.debug('Builded all modules');
	}

	public async onModuleDestroy(): Promise<void> {
		this.logger.warn('Stopping crons, cache, database, websocket, and cloud connections');
		try {
			this.webSocketServer.disconnectAllSockets();
			this.syncCronJob.stopCron();
			await this.mongoClient.close();
			if (this.redisClient.isConnected() === true)
				await this.redisClient.close();
			this.cognitoClient.destroy();
			this.snsClient.destroy();
			this.sqsClient.destroy();
			this.s3Client.destroy();
			await connection.close();
		} catch (error) {
			this.logger.error(error);
		}
	}

	public beforeApplicationShutdown(): void {
		this.logger.debug('Closed all connections');
	}

	public onApplicationShutdown(): void {
		this.logger.warn('Exiting Application');
		process.exit(1);
	}
}
