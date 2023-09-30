import dotenv from 'dotenv';
import { Server, getServerInstance } from './mocks/webSocket/socket.io';
import { getClientInstance } from './mocks/webSocket/socket.io-client';
import { Socket as ServerSocket } from 'socket.io';
import { Socket as ClientSocket } from 'socket.io-client';
import ioredisMock from 'ioredis-mock';
import mongoMock from 'mongo-mock';


dotenv.config({ path: '.env.test' });

// * backing services and dependencies mocks
jest.mock('src/infra/logging/LoggerGenerator.logger', () =>
	jest.requireActual('./mocks/logging/LoggerGenerator.logger')
);

jest.mock('src/infra/integration/rest/RestMockedService.client', () =>
	jest.requireActual('./mocks/rest/RestMockedService.client')
);

jest.mock('socket.io', () => {
	return {
		__esModule: true,
		Server,
		Socket: ServerSocket,
		serverInstance: getServerInstance(),
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
