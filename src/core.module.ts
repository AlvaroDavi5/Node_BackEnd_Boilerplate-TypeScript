import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import configs from '@configs/configs';
import Exceptions from '@infra/errors/Exceptions';
import LoggerGenerator from '@infra/logging/LoggerGenerator';
import RedisClient from '@infra/cache/RedisClient';
import SqsClient from '@infra/integration/aws/SqsClient';
import SnsClient from '@infra/integration/aws/SnsClient';
import S3Client from '@infra/integration/aws/S3Client';
import CognitoClient from '@infra/integration/aws/CognitoClient';
import RestClient from '@infra/integration/rest/RestClient';
import SyncCron from '@infra/cron/SyncCron';
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
		Exceptions,
		LoggerGenerator,
		RedisClient,
		SqsClient,
		SnsClient,
		S3Client,
		CognitoClient,
		RestClient,
		SyncCron,
	],
	exports: [
		Exceptions,
		LoggerGenerator,
		RedisClient,
		SqsClient,
		SnsClient,
		S3Client,
		CognitoClient,
		RestClient,
	],
})
export default class CoreModule { }
