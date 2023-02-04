import { AwilixContainer } from 'awilix';
import { Consumer } from 'sqs-consumer';
import { ScheduledTask } from 'node-cron';
import { Router } from 'express';
import { AnySchema } from 'joi';
import { Logger } from 'winston';
import { LoggerStream } from 'src/infra/logging/logger';
import SqsClient from 'src/infra/integration/aws/SqsClient';
import Application from 'src/app/Application';
import Repository from 'src/infra/repositories/Repository';
import HttpServer from 'src/interface/http/server/httpServer';
import RestServer from 'src/interface/http/server/restServer';
import WebSocketClient from 'src/interface/webSocket/client/Client';
import WebSocketServer, { WebSocketServerInterface } from 'src/interface/webSocket/server/Server';
import { HttpConstantsInteface } from 'src/interface/http/constants/httpConstants';
import { ConfigsInterface } from 'configs/configs';
import { RedisClientInterface } from 'src/infra/integration/cache/redisClient';
import { ExceptionInterface } from 'src/infra/errors/exceptions';


export type genericType = AwilixContainer | NodeModule | object | any
export type moduleType = { execute: (arg1?: any, arg2?: any) => genericType }

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
	userRepository: Repository,
	userPreferenceRepository: Repository,
	redisClient: RedisClientInterface,
	syncCron: ScheduledTask,
	eventsQueueConsumer: Consumer,
	SqsClient: SqsClient,
	// entitiesClient: moduleType,
	eventSchema: AnySchema,
	httpConstants: HttpConstantsInteface,
	logger: Logger,
	loggerStream: LoggerStream,
	exceptions: ExceptionInterface,
	container: AwilixContainer,
}
