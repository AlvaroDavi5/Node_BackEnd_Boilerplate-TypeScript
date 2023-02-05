// // libs import
import {
	AwilixContainer, createContainer, InjectionMode,
	asClass, asFunction, asValue,
} from 'awilix';
import { Consumer } from 'sqs-consumer';
import { ScheduledTask } from 'node-cron';
import { Router as ExpressRouter } from 'express';
import { AnySchema } from 'joi';
import { Logger as WinstonLogger } from 'winston';

// TODO: load all main modules
import configs, { ConfigsInterface } from 'configs/configs';
import Application from 'src/app/Application';
import syncCron from 'src/infra/cron/syncCron';
import eventsQueueConsumer from 'src/infra/integration/queue/consumers/eventsQueueConsumer';
import HttpServer from 'src/interface/http/server/httpServer';
import RestServer from 'src/interface/http/server/restServer';
import Router from 'src/interface/http/routers/router';
import SqsClient from 'src/infra/integration/aws/SqsClient';
import RestClient from 'src/infra/integration/rest/RestClient';
import Repository from 'src/infra/repositories/Repository';
import WebSocketServer, { WebSocketServerInterface } from 'src/interface/webSocket/server/Server';
import socketEventsRegister from 'src/interface/webSocket/events/socketEventsRegister';
import WebSocketClient from 'src/interface/webSocket/client/Client';
import redisClient, { RedisClientInterface } from 'src/infra/integration/cache/redisClient';
import { logger, LoggerStream } from 'src/infra/logging/logger';
import Exceptions, { ExceptionInterface } from 'src/infra/errors/exceptions';
import { HttpConstantsInteface } from 'src/interface/http/constants/httpConstants';


// ! container creation
const container = createContainer({
	injectionMode: InjectionMode.PROXY,
});

/**
 @asClass - register a class
 @asFunction - register a function
 @asValue - register a value
**/
container
	.register({
		// ? modules manual register
		application: asClass(Application).singleton(),
		configs: asValue(configs),
		httpServer: asClass(HttpServer).singleton(),
		restServer: asClass(RestServer).singleton(),
		router: asFunction(Router).singleton(),
		webSocketServer: asClass(WebSocketServer).singleton(),
		socketEventsRegister: asFunction(socketEventsRegister).singleton(),
		webSocketClient: asClass(WebSocketClient).singleton(),
		redisClient: asFunction(redisClient).singleton(),
		syncCron: asFunction(syncCron).singleton(),
		eventsQueueConsumer: asFunction(eventsQueueConsumer).singleton(),
		// apiGatewayClient: asClass(ApiGatewayClient).singleton(),
		// entitiesClient: asClass(EntitiesClient).singleton(),
		logger: asValue(logger),
		loggerStream: asClass(LoggerStream).singleton(),
		exceptions: asFunction(Exceptions).singleton(),
		container: asValue(container),
	})
	// * modules dynamic load
	.loadModules(
		[
			'src/app/helpers/**/*.ts',
			'src/app/mappers/**/*.ts',
			'src/app/operation/**/*.ts',
			'src/app/services/**/*.ts',
			'src/app/strategies/**/*.ts',
			'src/infra/integration/queue/handlers/**/*.ts',
			'src/infra/integration/queue/helpers/**/*.ts',
			'src/infra/providers/**/*.ts',
			'src/infra/repositories/**/*.ts',
			'src/infra/security/**/*.ts',
			'src/interface/http/constants/**/*.ts',
			'src/interface/http/controllers/**/*.ts',
			'src/interface/http/middlewares/**/*.ts',
			'src/interface/http/schemas/**/*.ts',
			'src/interface/queue/schemas/**/*.ts',
			'src/interface/webSocket/helpers/**/*.ts',
			'src/interface/webSocket/events/**/*.ts',
			'src/interface/websocket/schemas/**/*.ts',
		],
		{
			formatName: 'camelCase',
			resolverOptions: {
				injectionMode: InjectionMode.PROXY,
			}
		},
	);


export type genericType = AwilixContainer | NodeModule | object | any
export type moduleType = { execute: (arg1?: any, arg2?: any) => genericType }

export interface ContainerInterface {
	[key: string]: genericType,

	application: Application,
	configs: ConfigsInterface,
	httpServer: HttpServer,
	restServer: RestServer,
	router: ExpressRouter,
	webSocketServer: WebSocketServer,
	socketEventsRegister: (server: WebSocketServerInterface) => void,
	webSocketClient: WebSocketClient,
	userRepository: Repository,
	userPreferenceRepository: Repository,
	redisClient: RedisClientInterface,
	syncCron: ScheduledTask,
	eventsQueueConsumer: Consumer,
	sqsClient: SqsClient,
	restClient: RestClient,
	eventSchema: AnySchema,
	httpConstants: HttpConstantsInteface,
	logger: WinstonLogger,
	loggerStream: LoggerStream,
	exceptions: ExceptionInterface,
	container: AwilixContainer,
}

export default container;
