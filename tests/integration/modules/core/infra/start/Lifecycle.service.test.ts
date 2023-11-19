import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import LifecycleService from '../../../../../../src/modules/core/infra/start/Lifecycle.service';
import WebSocketServerAdapter from '../../../../../../src/modules/common/adapters/WebSocketServer.adapter';
import SyncCronJob from '../../../../../../src/modules/core/infra/cron/jobs/SyncCron.job';
import MongoClient from '../../../../../../src/modules/core/infra/data/Mongo.client';
import RedisClient from '../../../../../../src/modules/core/infra/cache/Redis.client';
import CognitoClient from '../../../../../../src/modules/core/infra/integration/aws/Cognito.client';
import SnsClient from '../../../../../../src/modules/core/infra/integration/aws/Sns.client';
import SqsClient from '../../../../../../src/modules/core/infra/integration/aws/Sqs.client';
import S3Client from '../../../../../../src/modules/core/infra/integration/aws/S3.client';
import LoggerGenerator from '../../../../../../src/modules/core/infra/logging/LoggerGenerator.logger';
import configs from '../../../../../../src/modules/core/configs/configs.config';
import LoggerGeneratorMock from '../../../../support/mocks/logging/LoggerGenerator.logger';
import { mockObservable } from '../../../../support/mocks/mockObservable';


describe('Modules :: Core :: Infra :: Start :: LifecycleService', () => {
	let nestTestingModule: TestingModule;
	// // mocks
	const configServiceMock: any = {
		get: (propertyPath?: string) => {
			if (propertyPath)
				return configs()[propertyPath];
			else
				return configs();
		},
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

	// ? build test app
	beforeAll(async () => {
		nestTestingModule = await Test.createTestingModule({
			providers: [
				{ provide: ConfigService, useValue: configServiceMock },
				{ provide: HttpAdapterHost, useValue: httpAdapterHostMock },
				{ provide: WebSocketServerAdapter, useValue: { getProvider: () => (webSocketServerMock), } },
				{ provide: SyncCronJob, useValue: syncCronJobMock },
				{ provide: MongoClient, useValue: mongoClientMock },
				{ provide: RedisClient, useValue: redisClientMock },
				{ provide: CognitoClient, useValue: awsClientMock },
				{ provide: SnsClient, useValue: awsClientMock },
				{ provide: SqsClient, useValue: awsClientMock },
				{ provide: S3Client, useValue: awsClientMock },
				{ provide: LoggerGenerator, useValue: new LoggerGeneratorMock(mockObservable) },
				LifecycleService,
			]
		}).compile();
	});

	describe('# Build and Close Application', () => {

		test('Should destroy, finish and close the app successfully', async () => {
			await nestTestingModule.close();

			expect(mockObservable.call).toHaveBeenCalledWith(['Closing HTTP server, disconnecting websocket clients, stopping crons and destroying cloud integrations']);
			expect(httpAdapterHostMock.httpAdapter.close).toHaveBeenCalledTimes(1);
			expect(webSocketServerMock.disconnectAllSockets).toHaveBeenCalledTimes(1);
			expect(webSocketServerMock.disconnect).toHaveBeenCalledTimes(1);
			expect(syncCronJobMock.stopCron).toHaveBeenCalledTimes(1);
			expect(mockObservable.call).toHaveBeenCalledWith(['Closing cache and database connections']);
			expect(mongoClientMock.disconnect).toHaveBeenCalledTimes(1);
			expect(redisClientMock.disconnect).toHaveBeenCalledTimes(1);
			expect(awsClientMock.destroy).toHaveBeenCalledTimes(4);
			expect(mockObservable.call).toHaveBeenCalledWith(['Exiting Application']);
			expect(mockObservable.call).toHaveBeenCalledTimes(3);
		});
	});
});
