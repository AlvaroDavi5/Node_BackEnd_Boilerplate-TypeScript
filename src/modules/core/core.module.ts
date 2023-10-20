import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import configs from '@core/configs/configs.config';
import LifecycleService from '@core/infra/start/Lifecycle.service';
import Exceptions from '@core/infra/errors/Exceptions';
import LoggerGenerator from '@core/infra/logging/LoggerGenerator.logger';
import RedisClient from '@core/infra/cache/Redis.client';
import MongoClient from '@core/infra/data/Mongo.client';
import SqsClient from '@core/infra/integration/aws/Sqs.client';
import SnsClient from '@core/infra/integration/aws/Sns.client';
import S3Client from '@core/infra/integration/aws/S3.client';
import CognitoClient from '@core/infra/integration/aws/Cognito.client';
import RestMockedServiceClient from '@core/infra/integration/rest/RestMockedService.client';
import SyncCronJob from '@core/infra/cron/jobs/SyncCron.job';
import SyncCronTask from '@core/infra/cron/tasks/SyncCron.task';
import CommonModule from '@common/common.module';
import AppModule from '@app/app.module';
import EventsModule from '@events/events.module';
import ApiModule from '@api/api.module';


@Global()
@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true, load: [configs] }),
		ScheduleModule.forRoot(),
		CommonModule,
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
