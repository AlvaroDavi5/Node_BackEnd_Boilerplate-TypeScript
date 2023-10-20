import {
	INestApplication, Module, NestModule,
	MiddlewareConsumer, ValidationPipe
} from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { SqsModule } from '@ssut/nestjs-sqs';
import configs from '../../../../src/modules/core/configs/configs.config';
import Exceptions from '../../../../src/modules/core/infra/errors/Exceptions';
import LoggerGenerator from '../../../../src/modules/core/infra/logging/LoggerGenerator.logger';
import RedisClient from '../../../../src/modules/core/infra/cache/Redis.client';
import MongoClient from '../../../../src/modules/core/infra/data/Mongo.client';
import SqsClient from '../../../../src/modules/core/infra/integration/aws/Sqs.client';
import SnsClient from '../../../../src/modules/core/infra/integration/aws/Sns.client';
import S3Client from '../../../../src/modules/core/infra/integration/aws/S3.client';
import CognitoClient from '../../../../src/modules/core/infra/integration/aws/Cognito.client';
import RestMockedServiceClient from '../../../../src/modules/core/infra/integration/rest/RestMockedService.client';
import SyncCronJob from '../../../../src/modules/core/infra/cron/jobs/SyncCron.job';
import SyncCronTask from '../../../../src/modules/core/infra/cron/tasks/SyncCron.task';
import SchemaValidator from '../../../../src/modules/common/utils/validators/SchemaValidator.validator';
import DataParserHelper from '../../../../src/modules/common/utils/helpers/DataParser.helper';
import UserOperationAdapter from '../../../../src/modules/common/adapters/UserOperation.adapter';
import SubscriptionServiceAdapter from '../../../../src/modules/common/adapters/SubscriptionService.adapter';
import EventsQueueProducerAdapter from '../../../../src/modules/common/adapters/EventsQueueProducer.adapter';
import WebSocketServerAdapter from '../../../../src/modules/common/adapters/WebSocketServer.adapter';
import WebSocketClientAdapter from '../../../../src/modules/common/adapters/WebSocketClient.adapter';
import CacheAccessHelper from '../../../../src/modules/common/utils/helpers/CacheAccess.helper';
import FileReaderHelper from '../../../../src/modules/common/utils/helpers/FileReader.helper';
import UserStrategy from '../../../../src/modules/app/strategies/User.strategy';
import UserOperation from '../../../../src/modules/app/operations/User.operation';
import UserService from '../../../../src/modules/app/services/User.service';
import UserPreferenceService from '../../../../src/modules/app/services/UserPreference.service';
import SubscriptionService from '../../../../src/modules/app/services/Subscription.service';
import UserRepository from '../../../../src/modules/app/repositories/user/User.repository';
import UserPreferenceRepository from '../../../../src/modules/app/repositories/userPreference/UserPreference.repository';
import WebSocketServer from '../../../../src/modules/events/websocket/server/WebSocket.server';
import WebSocketClient from '../../../../src/modules/events/websocket/client/WebSocket.client';
import EventsQueueConsumer from '../../../../src/modules/events/queue/consumers/EventsQueue.consumer';
import EventsQueueHandler from '../../../../src/modules/events/queue/handlers/EventsQueue.handler';
import EventsQueueProducer from '../../../../src/modules/events/queue/producers/EventsQueue.producer';
import MockedSqsClient from '../../../../src/dev/localstack/queues/SqsClient';
import HttpConstants from '../../../../src/modules/api/constants/Http.constants';
import LoggerMiddleware from '../../../../src/modules/api/middlewares/Logger.middleware';
import JwtDecodeMiddleware from '../../../../src/modules/api/middlewares/JwtDecode.middleware';
import DefaultController from '../../../../src/modules/api/controllers/Default.controller';
import UserController from '../../../../src/modules/api/controllers/User.controller';


// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true, load: [configs] }),
		ScheduleModule.forRoot(),
		SqsModule.register({
			consumers: [
				{
					sqs: new MockedSqsClient({
						logger: console,
						configs: configs(),
					}).getClient(),
					name: process.env.AWS_SQS_EVENTS_QUEUE_NAME || 'eventsQueue.fifo',
					queueUrl: process.env.AWS_SQS_EVENTS_QUEUE_URL || 'http://localhost:4566/000000000000/eventsQueue.fifo',
					region: process.env.AWS_REGION || 'us-east-1',
					batchSize: 10,
					shouldDeleteMessages: true,
					handleMessageTimeout: 1000,
					waitTimeSeconds: 20,
				},
			],
			producers: [],
		}),
	],
	controllers: [
		DefaultController,
		UserController,
	],
	providers: [
		// * infra
		Exceptions,
		LoggerGenerator,
		RedisClient,
		MongoClient,
		SqsClient,
		SnsClient,
		S3Client,
		CognitoClient,
		RestMockedServiceClient,
		SyncCronJob,
		SyncCronTask,
		// * common
		SchemaValidator,
		DataParserHelper,
		CacheAccessHelper,
		FileReaderHelper,
		UserOperationAdapter,
		SubscriptionServiceAdapter,
		EventsQueueProducerAdapter,
		WebSocketServerAdapter,
		WebSocketClientAdapter,
		// * app
		UserStrategy,
		UserOperation,
		UserService,
		UserPreferenceService,
		SubscriptionService,
		UserRepository,
		UserPreferenceRepository,
		// * events
		EventsQueueConsumer,
		EventsQueueHandler,
		EventsQueueProducer,
		WebSocketServer,
		WebSocketClient,
		// * api
		HttpConstants,
	],
})
export class NestGlobalModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(LoggerMiddleware)
			.forRoutes(DefaultController, UserController)
			.apply(JwtDecodeMiddleware)
			.forRoutes(UserController);
	}
}

export async function startNestApplication(nestApp: INestApplication<any>) {
	nestApp.setGlobalPrefix('api');
	nestApp.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	);

	const appConfigs = nestApp.get<ConfigService>(ConfigService).get<any>('application');
	nestApp.useWebSocketAdapter(new IoAdapter(nestApp));
	await nestApp.listen(Number(appConfigs?.port)).catch((error) => {
		throw error;
	});

	console.log(`\n App started with PID: ${process.pid} on URL: ${appConfigs?.url} \n`);

	process.on('uncaughtException', function (error: Error) {
		console.error('\n', error, '\n');
		process.exit();
	});
}
