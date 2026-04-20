import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import request from 'supertest';
import { fastifyAdapter } from '@core/configs/nestApi.config';
import LoggerService, { RequestLoggerProvider } from '@core/logging/Logger.service';
import HealthController from '@api/controllers/Health.controller';
import CustomThrottlerGuard from '@common/guards/CustomThrottler.guard';
import HttpMessagesConstants from '@common/constants/HttpMessages.constants';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import { configServiceMock } from '@dev/mocks/mockedModules';
import { createNestTestApplicationOptions, startNestApplication } from 'tests/integration/support/mocks/setupUtils';


describe('Modules :: API :: HealthController', () => {
	let nestTestApp: NestFastifyApplication;

	// // mocks
	const customThrottlerGuardMock = {
		handleRequest: jest.fn((..._args: unknown[]): Promise<boolean> => {
			return Promise.resolve(true);
		}),
	};
	const httpMessagesConstantsMock = {
		messages: {
			found: (element: string) => `${element} founded successfully.`,
		},
	};

	// ? build test app
	beforeAll(async () => {
		const nestTestingModule: TestingModule = await Test.createTestingModule({
			imports: [],
			controllers: [
				HealthController,
			],
			providers: [
				{ provide: ConfigService, useValue: configServiceMock },
				HttpMessagesConstants,
				DataParserHelper,
				LoggerService,
				RequestLoggerProvider,
			],
			exports: [],
		})
			.overrideGuard(CustomThrottlerGuard).useValue(customThrottlerGuardMock)
			.overrideProvider(HttpMessagesConstants).useValue(httpMessagesConstantsMock)
			.compile();

		nestTestApp = nestTestingModule.createNestApplication<NestFastifyApplication>(fastifyAdapter, createNestTestApplicationOptions);
		await startNestApplication(nestTestApp);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});
	afterAll(async () => {
		await nestTestApp.close();
	});

	describe('# [GET] /api/check', () => {
		test('Should get success', async () => {
			const response = await request(await nestTestApp.getHttpServer())
				.get('/api/check?key=value');

			expect(response.statusCode).toBe(200);
			expect(response.body).toEqual({
				method: 'GET',
				url: '/api/check?key=value',
				baseUrl: '/api/check',
				headers: {
					connection: 'close',
					host: '127.0.0.1:3000',
				},
				pathParams: {},
				queryParams: {
					key: 'value',
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
