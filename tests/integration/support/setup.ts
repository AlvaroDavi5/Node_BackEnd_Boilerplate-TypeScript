import dotenv from 'dotenv';
import ioredisMock from 'ioredis-mock';
import mongoMock from 'mongo-mock';
import { Server, ServerSocket } from './mocks/webSocket/socket.io';
import { ClientSocket } from './mocks/webSocket/socket.io-client';


dotenv.config({ path: '.env' });
process.env.NODE_ENV = 'test';

// * backing services and dependencies mocks
jest.mock('@core/logging/Logger.service.ts', () => jest.requireActual('./mocks/logging/Logger.service'));

jest.mock('@core/infra/providers/RestMockedService.provider.ts', () => jest.requireActual('./mocks/rest/RestMockedService.provider'));

/*
jest.mock('@core/infra/database/connection', () => {
	let isConnected = true;

	return {
		__esModule: true,
		connection: {
			authenticate: async (_options?: unknown) => {
				isConnected = true;
			},
			sync: async (_options?: unknown) => ({}),
			close: async () => { isConnected = false; },
		},
		syncConnection: async (_connection: unknown, _logger?: unknown) => {
			isConnected = !!isConnected;
		},
		testConnection: async (_connection: unknown, _logger?: unknown) => (isConnected),
	};
});
*/

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
		io: (_uri: string, _opts?: unknown) => (new ClientSocket()),
	};
});

jest.mock('ioredis', () => ioredisMock);

jest.mock('mongodb', () => mongoMock);
