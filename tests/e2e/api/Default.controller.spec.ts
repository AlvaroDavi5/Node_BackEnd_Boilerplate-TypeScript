import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { createNestApplicationOptions, startNestApplication } from '../support/mocks/setupUtils';
import CoreModule from '@core/core.module';


jest.setTimeout(5000);
describe('API :: DefaultController', () => {
	let nestTestApp: INestApplication;
	let nestTestingModule: TestingModule;

	// ? build test app
	beforeAll(async () => {
		nestTestingModule = await Test.createTestingModule({
			imports: [CoreModule]
		}).compile();

		nestTestApp = nestTestingModule.createNestApplication(createNestApplicationOptions);
		await startNestApplication(nestTestApp);
		await nestTestApp.init();
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
				statusMessage: 'Endpoint finded successfully.',
			});
		});
	});

	afterAll(async () => {
		await nestTestApp.close();
		await nestTestingModule.close();
	});
});
