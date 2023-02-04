// // libs import
import {
	createContainer, InjectionMode,
	asClass, asFunction, asValue,
} from 'awilix';


// TODO: load all main modules
import configs from 'configs/configs';
import Application from 'src/app/Application';
import syncCron from 'src/infra/cron/syncCron';
import eventsQueueConsumer from 'src/infra/integration/queue/consumers/eventsQueueConsumer';
import HttpServer from 'src/interface/http/server/httpServer';
import RestServer from 'src/interface/http/server/restServer';
import Router from 'src/interface/http/routers/router';
import WebSocketServer from 'src/interface/webSocket/server/Server';
import socketEventsRegister from 'src/interface/webSocket/events/socketEventsRegister';
import WebSocketClient from 'src/interface/webSocket/client/Client';
import redisClient from 'src/infra/integration/cache/redisClient';
import { logger, LoggerStream } from 'src/infra/logging/logger';
import Exceptions from 'src/infra/errors/exceptions';

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


export default container;
