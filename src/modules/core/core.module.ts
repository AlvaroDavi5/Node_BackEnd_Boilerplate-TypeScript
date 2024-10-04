import { APP_FILTER } from '@nestjs/core';
import { Module, Global, Scope } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { GraphQLModule } from '@nestjs/graphql';
import { GraphQLFormattedError } from 'graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { SentryModule } from '@sentry/nestjs/setup';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { join } from 'path';
import KnownExceptionFilter from '@api/filters/KnownException.filter';
import RequestRateConstants from '@common/constants/RequestRate.constants';
import { EnvironmentsEnum } from '@common/enums/environments.enum';
import CommonModule from '@common/common.module';
import AppModule from '@app/app.module';
import EventsModule from '@events/events.module';
import GraphQlModule from '@graphql/graphql.module';
import envsConfig from './configs/envs.config';
import LifecycleService from './start/Lifecycle.service';
import Exceptions from './errors/Exceptions';
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
		ConfigModule.forRoot({
			isGlobal: true,
			load: [envsConfig],
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
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			playground: appConfigs.environment === EnvironmentsEnum.DEVELOPMENT,
			autoSchemaFile: join(process.cwd(), 'src/modules/graphql/schemas/schema.gql'),
			formatError: ({ message, extensions, path }: GraphQLFormattedError, error: any) => {
				const graphQLFormattedError: GraphQLFormattedError = {
					message: message ?? error?.message,
					path: path ?? error?.path,
					extensions: {
						code: extensions?.code,
						originalError: extensions?.originalError,
					},
				};

				return graphQLFormattedError;
			},
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
		{
			provide: APP_FILTER,
			useClass: KnownExceptionFilter,
			scope: Scope.DEFAULT,
		},
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
