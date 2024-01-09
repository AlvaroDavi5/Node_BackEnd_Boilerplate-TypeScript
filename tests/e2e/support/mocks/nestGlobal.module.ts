import dotenv from 'dotenv';
import compression from 'compression';
import {
	INestApplication, Module, NestModule,
	MiddlewareConsumer, ValidationPipe
} from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { SqsModule } from '@ssut/nestjs-sqs';
import configs, { ConfigsInterface } from '@core/configs/configs.config';
import LifecycleService from '@core/infra/start/Lifecycle.service';
import { ProcessEventsEnum, ProcessSignalsEnum } from '@common/enums/processEvents.enum';
import Exceptions from '@core/infra/errors/Exceptions';
import { ExceptionsEnum } from '@common/enums/exceptions.enum';
import { ErrorInterface } from 'src/types/errorInterface';
import LoggerGenerator from '@core/infra/logging/LoggerGenerator.logger';
import CryptographyService from '@core/infra/security/Cryptography.service';
import DatabaseConnectionProvider from '@core/infra/database/connection';
import RedisClient from '@core/infra/cache/Redis.client';
import MongoClient from '@core/infra/data/Mongo.client';
import SqsClient from '@core/infra/integration/aws/Sqs.client';
import SnsClient from '@core/infra/integration/aws/Sns.client';
import S3Client from '@core/infra/integration/aws/S3.client';
import CognitoClient from '@core/infra/integration/aws/Cognito.client';
import RestMockedServiceClient from '@core/infra/integration/rest/RestMockedService.client';
import SyncCronJob from '@core/infra/cron/jobs/SyncCron.job';
import SyncCronTask from '@core/infra/cron/tasks/SyncCron.task';
import RegExConstants from '@common/constants/Regex.constants';
import SchemaValidator from '@common/utils/validators/SchemaValidator.validator';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import CacheAccessHelper from '@common/utils/helpers/CacheAccess.helper';
import FileReaderHelper from '@common/utils/helpers/FileReader.helper';
import FileStrategy from '@app/strategies/File.strategy';
import UserStrategy from '@app/strategies/User.strategy';
import UserOperation from '@app/operations/User.operation';
import UserService from '@app/services/User.service';
import UserPreferenceService from '@app/services/UserPreference.service';
import SubscriptionService from '@app/services/Subscription.service';
import UserRepository from '@app/repositories/user/User.repository';
import UserPreferenceRepository from '@app/repositories/userPreference/UserPreference.repository';
import WebSocketServer from '@events/websocket/server/WebSocket.server';
import WebSocketClient from '@events/websocket/client/WebSocket.client';
import EventsQueueConsumer from '@events/queue/consumers/EventsQueue.consumer';
import EventsQueueProducer from '@events/queue/producers/EventsQueue.producer';
import EventsQueueHandler from '@events/queue/handlers/EventsQueue.handler';
import MockedSqsClient from 'src/dev/localstack/queues/SqsClient';
import HttpConstants from '@api/constants/Http.constants';
import ContentTypeConstants from '@api/constants/ContentType.constants';
import RequestRateConstants from '@api/constants/RequestRate.constants';
import LoggerMiddleware from '@api/middlewares/Logger.middleware';
import JwtDecodeMiddleware from '@api/middlewares/JwtDecode.middleware';
import DefaultController from '@api/controllers/Default.controller';
import UserController from '@api/controllers/User.controller';
import SubscriptionsController from '@api/controllers/Subscriptions.controller';


const appConfigs = configs();
const requestRateConstants = new RequestRateConstants();

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [configs],
		}),
		ScheduleModule.forRoot(),
		EventEmitterModule.forRoot({
			maxListeners: 10,
			verboseMemoryLeak: true,
		}),
		ThrottlerModule.forRoot([
			requestRateConstants.short,
			requestRateConstants.medium,
			requestRateConstants.long,
		]),
		SqsModule.register({
			consumers: [
				{
					sqs: new MockedSqsClient({
						logger: console,
						configs: appConfigs,
					}).getClient(),
					name: appConfigs.integration.aws.sqs.eventsQueue.queueName || 'eventsQueue.fifo',
					queueUrl: appConfigs.integration.aws.sqs.eventsQueue.queueUrl || 'http://localhost:4566/000000000000/eventsQueue.fifo',
					region: appConfigs.integration.aws.credentials.region || 'us-east-1',
					batchSize: 10,
					shouldDeleteMessages: false,
					handleMessageTimeout: 1000,
					waitTimeSeconds: 20,
					authenticationErrorTimeout: 10000,
				},
			],
			producers: [],
		}),
	],
	controllers: [
		DefaultController,
		UserController,
		SubscriptionsController,
	],
	providers: [
		// * core
		LifecycleService,
		Exceptions,
		LoggerGenerator,
		CryptographyService,
		DatabaseConnectionProvider,
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
		RegExConstants,
		SchemaValidator,
		DataParserHelper,
		CacheAccessHelper,
		FileReaderHelper,
		// * app
		FileStrategy,
		UserStrategy,
		UserOperation,
		UserService,
		UserPreferenceService,
		SubscriptionService,
		UserRepository,
		UserPreferenceRepository,
		// * events
		EventsQueueConsumer,
		EventsQueueProducer,
		EventsQueueHandler,
		WebSocketServer,
		WebSocketClient,
		// * api
		HttpConstants,
		ContentTypeConstants,
		RequestRateConstants,
	],
	exports: [],
})
export class TestModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(LoggerMiddleware)
			.forRoutes(DefaultController, UserController, SubscriptionsController)
			.apply(JwtDecodeMiddleware)
			.forRoutes(UserController, SubscriptionsController);
	}
}

export async function startNestApplication(nestApp: INestApplication<any>) {
	dotenv.config({ path: '.env.test' });

	nestApp.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	);
	nestApp.enableShutdownHooks();

	nestApp.setGlobalPrefix('api');
	nestApp.use(compression());
	nestApp.enableCors({
		origin: '*',
		allowedHeaders: '*',
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
	});
	nestApp.useWebSocketAdapter(new IoAdapter(nestApp)); // WsAdapter

	const appConfigs = nestApp.get<ConfigService>(ConfigService).get<ConfigsInterface['application'] | undefined>('application');
	await nestApp.listen(Number(appConfigs?.port)).catch((error: ErrorInterface | Error) => {
		const knownExceptions = Object.values(ExceptionsEnum).map((exception) => exception.toString());

		if (error?.name && !knownExceptions.includes(error.name)) {
			const newError = new Error(error.message);
			newError.name = error.name;
			newError.stack = error.stack;

			throw newError;
		}
	});

	process.on(ProcessEventsEnum.UNCAUGHT_EXCEPTION, async (error: Error, origin: string) => {
		console.error(`\nApp received ${origin}: ${error}\n`);
		await nestApp.close();
	});
	process.on(ProcessEventsEnum.UNHANDLED_REJECTION, async (reason: unknown, promise: Promise<unknown>) => {
		console.error(`\nApp received ${ProcessEventsEnum.UNHANDLED_REJECTION}: \npromise: ${promise} \nreason: ${reason}\n`);
		await nestApp.close();
	});
	process.on(ProcessEventsEnum.MULTIPLE_RESOLVES, async (type: 'resolve' | 'reject', promise: Promise<unknown>, value: unknown) => {
		console.error(`\nApp received ${ProcessEventsEnum.MULTIPLE_RESOLVES}: \ntype: ${type} \npromise: ${promise} \nreason: ${value}\n`);
		await nestApp.close();
	});

	Object.values(ProcessSignalsEnum).map((signal) => process.on(signal, async (signal) => {
		console.error(`\nApp received signal: ${signal}\n`);
		await nestApp.close();
	}));
}
