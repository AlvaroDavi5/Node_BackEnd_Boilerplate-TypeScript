import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configs from '@configs/configs';
import Exceptions from '@infra/errors/exceptions';
import LoggerGenerator from '@infra/logging/logger';
import RedisClient from '@infra/cache/redisClient';
import SqsClient from '@infra/integration/aws/SqsClient';
import SnsClient from '@infra/integration/aws/SnsClient';
import S3Client from '@infra/integration/aws/S3Client';
import CognitoClient from '@infra/integration/aws/CognitoClient';
import RestClient from '@infra/integration/rest/RestClient';
import ApiModule from '@modules/api/api.module';
import AppModule from '@modules/app/app.module';


@Global()
@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true, load: [configs] }),
		ApiModule,
		AppModule,
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
