import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import configs from './configs/configs';
import { dataSourceOptions } from './database/datasource';
import { OrdersReportModule } from './modules/orders-report/orders-report.module';
import Application from 'src/app/Application';
import DefaultController from 'src/interface/http/controllers/defaultController';
import UserController from 'src/interface/http/controllers/userController';
import syncCron from 'src/infra/cron/syncCron';
import eventsQueueConsumer from 'src/infra/integration/queues/consumers/eventsQueueConsumer';
import eventsQueueProducer from 'src/infra/integration/queues/producers/eventsQueueProducer';
import HttpConstants from 'src/interface/http/constants/httpConstants';
import HttpServer from 'src/interface/http/server/httpServer';
import RestServer from 'src/interface/http/server/restServer';
import SqsClient from 'src/infra/integration/aws/SqsClient';
import SnsClient from 'src/infra/integration/aws/SnsClient';
import S3Client from 'src/infra/integration/aws/S3Client';
import CognitoClient from 'src/infra/integration/aws/CognitoClient';
import RestClient from 'src/infra/integration/rest/RestClient';
import UserRepository from 'src/infra/repositories/user/UserRepository';
import UserPreferenceRepository from 'src/infra/repositories/userPreference/UserPreferenceRepository';
import WebSocketServer from 'src/interface/webSocket/server/Server';
import socketEventsRegister from 'src/interface/webSocket/events/socketEventsRegister';
import WebSocketClient from 'src/interface/webSocket/client/Client';
import RedisClient from 'src/infra/cache/redisClient';
import logger, { LoggerStream } from 'src/infra/logging/logger';
import Exceptions from 'src/infra/errors/exceptions';


@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true, load: [configs] }),
		// TypeOrmModule.forRoot(dataSourceOptions),
		// OrdersReportModule,
	],
	controllers: [
		DefaultController,
	],
	providers: [
		HttpConstants,
	],
})
export default class ContainerModule { }
