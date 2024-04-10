import { Test, TestingModule } from '@nestjs/testing';
import LifecycleService from '../../../../../../src/modules/core/infra/start/Lifecycle.service';
import configs from '../../../../../../src/modules/core/configs/configs.config';
import LoggerProviderMock from '../../../../support/mocks/logging/Logger.provider';
import { mockObservable } from '../../../../support/mocks/mockObservable';


describe('Modules :: Core :: Infra :: Start :: LifecycleService', () => {
	let nestTestingModule: TestingModule;
	// // mocks
	const configServiceMock = {
		get: (propertyPath?: string): any => {
			if (propertyPath) {
				const splitedPaths = propertyPath.split('.');
				let scopedProperty: any = configs();

				for (let i = 0; i < splitedPaths.length; i++) {
					const scopedPath = splitedPaths[i];

					if (scopedPath.length)
						scopedProperty = scopedProperty[scopedPath];
				}

				return scopedProperty;
			}
			else
				return configs();
		},
	};
	const databaseConnectionMock = {
		close: jest.fn((...args: unknown[]): void => { args.forEach((arg) => console.log(arg)); }),
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
	const s3ClientMock = {
		listBuckets: jest.fn(async (): Promise<string[]> => { return []; }),
		createBucket: jest.fn(async (bucketName: string): Promise<string> => { return `/${bucketName}/`; }),
		destroy: jest.fn((...args: unknown[]): void => { args.forEach((arg) => console.log(arg)); }),
	};
	const awsClientMock = {
		destroy: jest.fn((...args: unknown[]): void => { args.forEach((arg) => console.log(arg)); }),
	};
	const loggerProviderMock = new LoggerProviderMock(mockObservable);
	const lifecycleServiceMock = new LifecycleService(
		httpAdapterHostMock as any, configServiceMock as any,
		databaseConnectionMock as any, mongoClientMock, redisClientMock,
		awsClientMock, awsClientMock, awsClientMock, s3ClientMock,
		webSocketServerMock, syncCronJobMock, loggerProviderMock); // ! mock instanced outside testing module due TypeError

	// ? build test app
	beforeAll(async () => {
		nestTestingModule = await Test.createTestingModule({
			providers: [
				{ provide: LifecycleService, useValue: lifecycleServiceMock },
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
			expect(databaseConnectionMock.close).toHaveBeenCalledTimes(1);
			expect(awsClientMock.destroy).toHaveBeenCalledTimes(3);
			expect(s3ClientMock.destroy).toHaveBeenCalledTimes(1);
			expect(mockObservable.call).toHaveBeenCalledWith('Exiting Application');
			expect(mockObservable.call).toHaveBeenCalledTimes(5);
		});
	});
});
