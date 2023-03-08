import dotenv from 'dotenv';
import supertest from 'supertest';
import defaults from 'superagent-defaults';
import container from '../../../src/container';
import { getConsumerInstance } from './mocks/queue/sqs-consumer';
import { getCronInstance } from './mocks/cron/node-cron';
import { Server, getServerInstance } from './mocks/webSocket/socket.io';
import { getClientInstance } from './mocks/webSocket/socket.io-client';
import ioredisMock from 'ioredis-mock';
dotenv.config({ path: '.env.test' });

// * backing services and dependencies mocks
jest.mock('src/infra/logging/logger', () =>
	jest.requireActual('./mocks/logging/logger')
);

jest.mock('src/infra/integration/rest/RestClient', () =>
	jest.requireActual('./mocks/httpClients/RestClient')
);

jest.mock('sqs-consumer', () => {
	const originalModule = jest.requireActual('sqs-consumer');
	return {
		__esModule: true,
		...originalModule,
		Consumer: getConsumerInstance(),
	};
});

jest.mock('node-cron', () => {
	return getCronInstance();
});

jest.mock('socket.io', () => {
	return {
		__esModule: true,
		Server,
		serverInstance: getServerInstance(),
	};
});

jest.mock('socket.io-client', () => {
	return {
		__esModule: true,
		io: getClientInstance,
	};
});

jest.mock('ioredis', () => ioredisMock);


// ? services imports and mocks
const httpServer = container.resolve('httpServer');

const httpRequest = defaults(supertest(httpServer.express));

global.app = container;

export default httpRequest;
