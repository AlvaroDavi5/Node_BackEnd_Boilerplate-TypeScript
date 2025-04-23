import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import HealthController from '@api/controllers/Health.controller';
import CustomThrottlerGuard from '@common/guards/CustomThrottler.guard';
import HttpMessagesConstants from '@common/constants/HttpMessages.constants';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import { MockObservableInterface } from 'tests/integration/support/mocks/mockObservable';
import LoggerService from 'tests/integration/support/mocks/logging/Logger.service';
import { createNestTestApplicationOptions, startNestApplication } from 'tests/integration/support/mocks/setupUtils';

describe('Modules :: API :: HealthController', () => {
	let nestTestApp: INestApplication;
	let nestTestingModule: TestingModule;
	// // mocks
	const customThrottlerGuardMock = {
		handleRequest: jest.fn((..._args: unknown[]): Promise<boolean> => { return Promise.resolve(true); }),
	};
	const httpMessagesConstantsMock = {
		messages: {
			found: (element: string) => `${element} founded successfully.`,
		},
	};
	const mockObservable: MockObservableInterface<void, unknown[]> = {
		call: jest.fn((..._args: unknown[]): void => (undefined)),
	};
	const loggerServiceMock = new LoggerService(mockObservable);

	// ? build test app
	beforeAll(async () => {
		nestTestingModule = await Test.createTestingModule({
			imports: [],
			controllers: [
				HealthController,
			],
			providers: [
				HttpMessagesConstants,
				DataParserHelper,
				{ provide: LoggerService, useValue: loggerServiceMock },
			],
			exports: [],
		})
			.overrideGuard(CustomThrottlerGuard).useValue(customThrottlerGuardMock)
			.overrideProvider(HttpMessagesConstants).useValue(httpMessagesConstantsMock)
			.compile();

		nestTestApp = nestTestingModule.createNestApplication(createNestTestApplicationOptions);
		await startNestApplication(nestTestApp);
		await nestTestApp.init();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});
	afterAll(async () => {
		await nestTestApp.close();
		await nestTestingModule.close();
	});

	describe('# [GET] /api/check', () => {
		test('Should get success', async () => {
			const response = await request(await nestTestApp.getHttpServer())
				.get('/api/check?key=value')
				.send({
					test: 'Hello World!',
				});

			expect(response.statusCode).toBe(200);
			expect(response.body).toEqual({
				method: 'GET',
				url: '/api/check?key=value',
				baseUrl: '',
				headers: {
					connection: 'close',
					host: '127.0.0.1:3000',
				},
				pathParams: {},
				queryParams: {
					key: 'value',
				},
				body: {
					test: 'Hello World!',
				},
				statusCode: 200,
				statusMessage: 'Endpoint founded successfully.',
			});
		});
	});

	describe('# [GET] /api/v1/check', () => {
		test('Should get success', async () => {
			const response = await request(await nestTestApp.getHttpServer())
				.get('/api/v1/check?key=value')
				.send({
					test: 'Hello World!',
				});

			expect(response.statusCode).toBe(200);
			expect(response.text).toEqual('OK');
		});
	});
});
