import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import configs from '@configs/configs.config';
import LifecycleService from '@infra/start/Lifecycle.service';
import Exceptions from '@infra/errors/Exceptions';
import LoggerGenerator from '@infra/logging/LoggerGenerator.logger';
import RedisClient from '@infra/cache/Redis.client';
import MongoClient from '@infra/data/Mongo.client';
import SqsClient from '@infra/integration/aws/Sqs.client';
import SnsClient from '@infra/integration/aws/Sns.client';
import S3Client from '@infra/integration/aws/S3.client';
import CognitoClient from '@infra/integration/aws/Cognito.client';
import RestMockedServiceClient from '@infra/integration/rest/RestMockedService.client';
import SyncCronJob from '@infra/cron/jobs/SyncCron.job';
import SyncCronTask from '@infra/cron/tasks/SyncCron.task';
import UtilsModule from '@modules/utils/utils.module';
import AppModule from '@modules/app/app.module';
import EventsModule from '@modules/events/events.module';
import ApiModule from '@modules/api/api.module';


@Global()
@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true, load: [configs] }),
		ScheduleModule.forRoot(),
		UtilsModule,
		AppModule,
		EventsModule,
		ApiModule,
	],
	controllers: [],
	providers: [
		LifecycleService,
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
	],
	exports: [
		Exceptions,
		LoggerGenerator,
		RedisClient,
		MongoClient,
		SqsClient,
		SnsClient,
		S3Client,
		CognitoClient,
		RestMockedServiceClient,
	],
})
export default class CoreModule { }
