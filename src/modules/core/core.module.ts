import { join } from 'path';
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { SentryModule } from '@sentry/nestjs/setup';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import AppModule from '@app/app.module';
import GraphQlModule from '@graphql/graphql.module';
import EventsModule from '@events/events.module';
import RequestRateConstants from '@common/constants/RequestRate.constants';
import { EnvironmentsEnum } from '@common/enums/environments.enum';
import CommonModule from '@common/common.module';
import envsConfig from './configs/envs.config';
import LifecycleService from './start/Lifecycle.service';
import Exceptions from './errors/Exceptions';
import { formatGraphQlError } from './errors/trackers';
import LoggerService, { RequestLoggerProvider } from './logging/Logger.service';
import CryptographyService from './security/Cryptography.service';
import DatabaseConnectionProvider from './infra/database/connection';
import RedisClient from './infra/cache/Redis.client';
import MongoClient from './infra/data/Mongo.client';
import SqsClient from './infra/integration/aws/Sqs.client';
import SnsClient from './infra/integration/aws/Sns.client';
import S3Client from './infra/integration/aws/S3.client';
import CognitoClient from './infra/integration/aws/Cognito.client';
import RestMockedServiceProvider from './infra/providers/RestMockedService.provider';
import SyncCronJob from './cron/jobs/SyncCron.job';
import SyncCronTask from './cron/tasks/SyncCron.task';


const { application: appConfigs } = envsConfig();
const requestRateConstants = new RequestRateConstants();

@Global()
@Module({
	imports: [
		EventEmitterModule.forRoot({
			maxListeners: 10,
			verboseMemoryLeak: true,
		}),
		ScheduleModule.forRoot(),
		ThrottlerModule.forRoot([
			requestRateConstants.short,
			requestRateConstants.medium,
			requestRateConstants.long,
		]),
		ConfigModule.forRoot({
			isGlobal: true,
			load: [envsConfig],
		}),
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			playground: appConfigs.environment === EnvironmentsEnum.DEVELOPMENT,
			autoSchemaFile: join(process.cwd(), 'src/modules/graphql/schemas/schema.gql'),
			formatError: formatGraphQlError,
			include: [],
		}),
		SentryModule.forRoot(),
		DevtoolsModule.register({
			http: appConfigs.environment === EnvironmentsEnum.DEVELOPMENT,
			port: appConfigs.nestDevToolsPort,
		}),
		CommonModule,
		AppModule,
		EventsModule,
		GraphQlModule,
	],
	controllers: [],
	providers: [
		LifecycleService,
		Exceptions,
		LoggerService,
		RequestLoggerProvider,
		CryptographyService,
		DatabaseConnectionProvider,
		RedisClient,
		MongoClient,
		SqsClient,
		SnsClient,
		S3Client,
		CognitoClient,
		RestMockedServiceProvider,
		SyncCronJob,
		SyncCronTask,
	],
	exports: [
		Exceptions,
		LoggerService,
		RequestLoggerProvider,
		CryptographyService,
		DatabaseConnectionProvider,
		RedisClient,
		MongoClient,
		SqsClient,
		SnsClient,
		S3Client,
		CognitoClient,
		RestMockedServiceProvider,
	],
})
export default class CoreModule { }
