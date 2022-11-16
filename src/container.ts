// // libs import
import {
	createContainer, InjectionMode,
	asClass, asFunction, asValue,
} from 'awilix';


// TODO: load all main modules
import Application from 'src/app/Application';
import staticConfigs from 'configs/staticConfigs';
import HttpServer from 'src/interface/httpServer';
import RestServer from 'src/interface/api/http/server/restServer';
import Router from 'src/interface/api/http/routers/router';
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
		configs: asValue(staticConfigs),
		httpServer: asClass(HttpServer).singleton(),
		restServer: asClass(RestServer).singleton(),
		router: asFunction(Router).singleton(),
		logger: asValue(logger),
		loggerStream: asClass(LoggerStream).singleton(),
		exceptions: asFunction(Exceptions).singleton(),
		container: asValue(container),
	})
	// * modules dynamic load
	.loadModules(
		[
			'src/app/helpers/**/*.ts',
			'src/app/operation/**/*.ts',
			'src/app/services/**/*.ts',
			'src/app/strategies/**/*.ts',
			'src/infra/crons/**/*.ts',
			'src/infra/helpers/**/*.ts',
			'src/infra/integration/**/*.ts',
			'src/infra/logging/**/*.ts',
			'src/infra/mappers/**/*.ts',
			'src/infra/providers/**/*.ts',
			'src/infra/repositories/**/*.ts',
			'src/infra/security/**/*.ts',
			'src/interface/api/http/constants/**/*.ts',
			'src/interface/api/http/controllers/**/*.ts',
			'src/interface/api/http/middlewares/**/*.ts',
			'src/interface/api/http/schemas/**/*.ts',
			'src/interface/api/websocket/controllers/**/*.ts',
			'src/interface/api/websocket/middlewares/**/*.ts',
			'src/interface/api/websocket/schemas/**/*.ts',
		],
		{
			formatName: 'camelCase',
			resolverOptions: {
				injectionMode: InjectionMode.PROXY,
			}
		},
	);


export default container;
