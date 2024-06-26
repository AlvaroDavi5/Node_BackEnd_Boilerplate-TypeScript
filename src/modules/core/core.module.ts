import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { GraphQLFormattedError } from 'graphql';
import { join } from 'path';
import configs from './configs/configs.config';
import LifecycleService from './start/Lifecycle.service';
import Exceptions from './errors/Exceptions';
import LoggerService, { SingletonLoggerProvider, RequestLoggerProvider } from './logging/Logger.service';
import CryptographyService from './security/Cryptography.service';
import DatabaseConnectionProvider from './infra/database/connection';
import RedisClient from './infra/cache/Redis.client';
import MongoClient from './infra/data/Mongo.client';
import SqsClient from './infra/integration/aws/Sqs.client';
import SnsClient from './infra/integration/aws/Sns.client';
import S3Client from './infra/integration/aws/S3.client';
import CognitoClient from './infra/integration/aws/Cognito.client';
import RestMockedServiceClient from './infra/integration/rest/RestMockedService.client';
import SyncCronJob from './cron/jobs/SyncCron.job';
import SyncCronTask from './cron/tasks/SyncCron.task';
import CommonModule from '@common/common.module';
import AppModule from '@app/app.module';
import EventsModule from '@events/events.module';
import GraphQlModule from '@graphql/graphql.module';
import RequestRateConstants from '@common/constants/RequestRate.constants';
import { EnvironmentsEnum } from '@common/enums/environments.enum';


const { application: appConfigs } = configs();
const requestRateConstants = new RequestRateConstants();

@Global()
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
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			playground: appConfigs.environment === EnvironmentsEnum.DEVELOPMENT,
			autoSchemaFile: join(process.cwd(), 'src/modules/graphql/schemas/schema.gql'),
			formatError: (formattedError: GraphQLFormattedError, error: any) => {
				const extensions = formattedError.extensions as any;

				const graphQLFormattedError: GraphQLFormattedError = {
					message: formattedError.message ?? error?.message,
					path: formattedError.path ?? error?.path,
					extensions: {
						code: extensions?.code,
						originalError: extensions?.originalError,
					},
				};

				return graphQLFormattedError;
			},
			include: [],
		}),
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
		SingletonLoggerProvider,
		RequestLoggerProvider,
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
	],
	exports: [
		Exceptions,
		LoggerService,
		SingletonLoggerProvider,
		RequestLoggerProvider,
		CryptographyService,
		DatabaseConnectionProvider,
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
