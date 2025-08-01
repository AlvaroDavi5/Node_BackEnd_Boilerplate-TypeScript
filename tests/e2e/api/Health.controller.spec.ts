import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import CoreModule from '@core/core.module';
import { createNestTestApplicationOptions, startNestApplication } from 'tests/e2e/support/mocks/setupUtils';


jest.setTimeout(5000);
describe('API :: HealthController', () => {
	let nestTestApp: INestApplication;

	// ? build test app
	beforeAll(async () => {
		const nestTestingModule: TestingModule = await Test.createTestingModule({
			imports: [CoreModule],
		}).compile();

		nestTestApp = nestTestingModule.createNestApplication(createNestTestApplicationOptions);
		await startNestApplication(nestTestApp);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});
	afterAll(async () => {
		await nestTestApp.close();
	});

	describe('# [GET] /api/check', () => {
		test('Success response', async () => {
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
		test('Success response', async () => {
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
