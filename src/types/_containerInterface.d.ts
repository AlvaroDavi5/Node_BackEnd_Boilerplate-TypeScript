import { AwilixContainer } from 'awilix';
import { AnySchema } from 'joi';
import { Consumer } from 'sqs-consumer';
import { ScheduledTask } from 'node-cron';
import { Router } from 'express';
import { Logger } from 'winston';

import Application from 'src/app/Application';
import HttpServer from 'src/interface/http/server/httpServer';
import RestServer from 'src/interface/http/server/restServer';
import SqsClient from 'src/infra/integration/aws/SqsClient';
import SnsClient from 'src/infra/integration/aws/SnsClient';
import S3Client from 'src/infra/integration/aws/S3Client';
import CognitoClient from 'src/infra/integration/aws/CognitoClient';
import RestClient from 'src/infra/integration/rest/RestClient';
import UserRepository from 'src/infra/repositories/user/UserRepository';
import UserPreferenceRepository from 'src/infra/repositories/userPreference/UserPreferenceRepository';
import { ConfigsInterface } from 'configs/configs';
import WebSocketServer, { WebSocketServerInterface } from 'src/interface/webSocket/server/Server';
import WebSocketClient from 'src/interface/webSocket/client/Client';
import RedisClient from 'src/infra/integration/cache/redisClient';
import { LoggerStream } from 'src/infra/logging/logger';
import { ExceptionInterface } from 'src/infra/errors/exceptions';
import { HttpConstantsInteface } from 'src/interface/http/constants/httpConstants';


export type genericType = NodeModule | object | any

export interface ContainerInterface {
	[key: string]: genericType,

	application: Application,
	configs: ConfigsInterface,
	httpServer: HttpServer,
	restServer: RestServer,
	router: Router,
	webSocketServer: WebSocketServer,
	socketEventsRegister: (server: WebSocketServerInterface) => void,
	webSocketClient: WebSocketClient,
	userRepository: UserRepository,
	userPreferenceRepository: UserPreferenceRepository,
	redisClient: RedisClient,
	sqsClient: SqsClient,
	snsClient: SnsClient,
	s3Client: S3Client,
	cognitoClient: CognitoClient,
	restClient: RestClient,
	syncCron: ScheduledTask,
	eventsQueueConsumer: Consumer,
	eventSchema: AnySchema,
	httpConstants: HttpConstantsInteface,
	logger: Logger,
	loggerStream: LoggerStream,
	exceptions: ExceptionInterface,
	container: AwilixContainer,
}
