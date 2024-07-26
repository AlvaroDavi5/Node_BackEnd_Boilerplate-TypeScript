import dotenv from 'dotenv';
import ioredisMock from 'ioredis-mock';
import mongoMock from 'mongo-mock';
import { Server, ServerSocket } from './mocks/webSocket/socket.io';
import { ClientSocket } from './mocks/webSocket/socket.io-client';


dotenv.config({ path: '.env.test' });

// * backing services and dependencies mocks
jest.mock('src/modules/core/logging/Logger.service.ts', () =>
	jest.requireActual('./mocks/logging/Logger.service')
);

jest.mock('src/modules/core/infra/providers/RestMockedService.provider.ts', () =>
	jest.requireActual('./mocks/rest/RestMockedService.provider')
);

/*
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
		io: (_uri: string, _opts?: any) => (new ClientSocket()),
	};
});

jest.mock('ioredis', () => ioredisMock);

jest.mock('mongodb', () => mongoMock);
