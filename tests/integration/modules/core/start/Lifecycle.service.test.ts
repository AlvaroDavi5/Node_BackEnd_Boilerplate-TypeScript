import { Test, TestingModule } from '@nestjs/testing';
import { HttpAdapterHost } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import LifecycleService from '@core/start/Lifecycle.service';
import { DATABASE_CONNECTION_PROVIDER } from '@core/infra/database/connection';
import WebSocketServer from '@events/websocket/server/WebSocket.server';
import SyncCronJob from '@core/cron/jobs/SyncCron.job';
import MongoClient from '@core/infra/data/Mongo.client';
import RedisClient from '@core/infra/cache/Redis.client';
import SqsClient from '@core/infra/integration/aws/Sqs.client';
import SnsClient from '@core/infra/integration/aws/Sns.client';
import S3Client from '@core/infra/integration/aws/S3.client';
import CognitoClient from '@core/infra/integration/aws/Cognito.client';
import { configServiceMock } from '@dev/mocks/mockedModules';
import LoggerService from '../../../support/mocks/logging/Logger.service';
import { MockObservableInterface } from 'tests/integration/support/mocks/mockObservable';

describe('Modules :: Core :: Start :: LifecycleService', () => {
	let nestTestingModule: TestingModule;
	// // mocks
	const databaseConnectionMock = {
		destroy: jest.fn((...args: unknown[]): void => { args.forEach((arg) => console.log(arg)); }),
	};
	const httpAdapterHostMock = {
		httpAdapter: {
			close: jest.fn((...args: unknown[]): void => { args.forEach((arg) => console.log(arg)); }),
		},
	};
	const webSocketServerMock = {
		disconnect: jest.fn((...args: unknown[]): void => { args.forEach((arg) => console.log(arg)); }),
		disconnectAllSockets: jest.fn((...args: unknown[]): void => { args.forEach((arg) => console.log(arg)); }),
	};
	const syncCronJobMock = {
		stopCron: jest.fn((...args: unknown[]): void => { args.forEach((arg) => console.log(arg)); }),
	};
	const mongoClientMock = {
		isConnected: true,
		disconnect: jest.fn((...args: unknown[]): void => {
			args.forEach((arg) => console.log(arg));
			mongoClientMock.isConnected = false;
		}),
	};
	const redisClientMock = {
		isConnected: true,
		disconnect: jest.fn((...args: unknown[]): void => {
			args.forEach((arg) => console.log(arg));
			redisClientMock.isConnected = false;
		}),
	};
	const awsClientMock = {
		destroy: jest.fn((...args: unknown[]): void => { args.forEach((arg) => console.log(arg)); }),
	};
	const mockObservable: MockObservableInterface<void, unknown[]> = {
		call: jest.fn((...args: unknown[]): void => (undefined)),
	};
	const loggerServiceMock = new LoggerService(mockObservable);

	// ? build test app
	beforeAll(async () => {
		nestTestingModule = await Test.createTestingModule({
			providers: [
				{ provide: ConfigService, useValue: configServiceMock },
				{ provide: DATABASE_CONNECTION_PROVIDER, useValue: databaseConnectionMock },
				{ provide: HttpAdapterHost, useValue: httpAdapterHostMock },
				{ provide: WebSocketServer, useValue: webSocketServerMock },
				{ provide: SyncCronJob, useValue: syncCronJobMock },
				{ provide: MongoClient, useValue: mongoClientMock },
				{ provide: RedisClient, useValue: redisClientMock },
				{ provide: SqsClient, useValue: awsClientMock },
				{ provide: SnsClient, useValue: awsClientMock },
				{ provide: S3Client, useValue: awsClientMock },
				{ provide: CognitoClient, useValue: awsClientMock },
				{ provide: LoggerService, useValue: loggerServiceMock },
				LifecycleService,
			]
		}).compile();
	});

	describe('# Build and Close Application', () => {
		test('Should destroy, finish and close the app successfully', async () => {
			await nestTestingModule.init();
			await nestTestingModule.close();

			expect(mockObservable.call).toHaveBeenCalledWith('Builded host module');
			expect(mockObservable.call).toHaveBeenCalledWith('Closing HTTP server, disconnecting websocket clients, stopping crons and destroying cloud integrations');
			expect(httpAdapterHostMock.httpAdapter.close).toHaveBeenCalledTimes(1);
			expect(webSocketServerMock.disconnectAllSockets).toHaveBeenCalledTimes(1);
			expect(webSocketServerMock.disconnect).toHaveBeenCalledTimes(1);
			expect(syncCronJobMock.stopCron).toHaveBeenCalledTimes(1);
			expect(mockObservable.call).toHaveBeenCalledWith('Closing cache and database connections');
			expect(mongoClientMock.disconnect).toHaveBeenCalledTimes(1);
			expect(redisClientMock.disconnect).toHaveBeenCalledTimes(1);
			expect(databaseConnectionMock.destroy).toHaveBeenCalledTimes(1);
			expect(awsClientMock.destroy).toHaveBeenCalledTimes(4);
			expect(mockObservable.call).toHaveBeenCalledWith('Exiting Application');
			expect(mockObservable.call).toHaveBeenCalledTimes(5);
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});
});
