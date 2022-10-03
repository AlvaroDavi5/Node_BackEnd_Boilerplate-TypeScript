// // libs import
import {
	createContainer, InjectionMode,
	asClass, asFunction, asValue,
} from 'awilix';
import { messageType } from "src/types/_messageType";


// TODO: load all modules
import Application from 'src/app/Application';
const logger = () => ({
	error: (msg: messageType) => {
		console.error(msg);
	},
	warn: (msg: messageType) => {
		console.warn(msg);
	},
	info: (msg: messageType) => {
		console.info(msg);
	},
	log: (msg: messageType) => {
		console.log(msg);
	},
});
const appInfo = {
	name: 'Node.js DDD Boilerplate',
	type: 'boilerplate',
};

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
		// * modules manual register
		application: asClass(Application).singleton(),
		logger: asFunction(logger).singleton(),
		appInfo: asValue(appInfo),
	})
	// ? modules dynamic load
	.loadModules(
		[
			'src/app/helpers/**/*.ts',
			'src/app/mappers/**/*.ts',
			'src/app/operation/**/*.ts',
			'src/app/services/**/*.ts',
			'src/app/strategies/**/*.ts',
			'src/domain/factories/**/*.ts',
			'src/domain/stateMachines/**/*.ts',
			'src/infra/crons/**/*.ts',
			'src/infra/errors/**/*.ts',
			'src/infra/helpers/**/*.ts',
			'src/infra/integration/**/*.ts',
			'src/infra/logging/**/*.ts',
			'src/infra/providers/**/*.ts',
			'src/infra/repositories/**/*.ts',
			'src/interface/api/http/**/*.ts',
			'src/interface/api/webscoket/**/*.ts',
		],
		{
			formatName: 'camelCase',
			resolverOptions: {
				injectionMode: InjectionMode.PROXY,
			}
		},
	);


export default container;
