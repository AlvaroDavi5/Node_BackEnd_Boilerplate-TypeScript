import dotenv from 'dotenv';
import ioredisMock from 'ioredis-mock';
import mongoMock from 'mongo-mock';
import { Socket as ServerSocket } from 'socket.io';
import { Socket as ClientSocket } from 'socket.io-client';
import { Server } from './mocks/webSocket/socket.io';
import { getClientInstance } from './mocks/webSocket/socket.io-client';


dotenv.config({ path: '.env.test' });

// * backing services and dependencies mocks
jest.mock('src/modules/core/infra/logging/LoggerGenerator.logger.ts', () =>
	jest.requireActual('./mocks/logging/LoggerGenerator.logger')
);

jest.mock('src/modules/core/infra/integration/rest/RestMockedService.client.ts', () =>
	jest.requireActual('./mocks/rest/RestMockedService.client')
);

jest.mock('src/modules/core/infra/database/connection', () => {
	let isConnected = true;

	return {
		__esModule: true,
		connection: {
			authenticate: async (options?: any) => {
				isConnected = true;
			},
			sync: async (options?: any) => ({}),
			close: async () => { isConnected = false; },
		},
		syncConnection: async (connection: any, logger?: any) => {
			isConnected = !!isConnected;
		},
		testConnection: async (connection: any, logger?: any) => (isConnected),
	};
});

jest.mock('socket.io', () => {
	return {
		__esModule: true,
		Server,
		Socket: ServerSocket,
	};
});

jest.mock('socket.io-client', () => {
	return {
		__esModule: true,
		Socket: ClientSocket,
		io: getClientInstance,
	};
});

jest.mock('ioredis', () => ioredisMock);

jest.mock('mongodb', () => mongoMock);
