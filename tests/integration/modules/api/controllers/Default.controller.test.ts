import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import CustomThrottlerGuard from '@api/guards/Throttler.guard';
import DefaultController from '@api/controllers/Default.controller';
import HttpConstants from '@common/constants/Http.constants';
import { createNestTestApplicationOptions, startNestApplication } from 'tests/integration/support/mocks/setupUtils';


describe('Modules :: API :: DefaultController', () => {
	let nestTestApp: INestApplication;
	let nestTestingModule: TestingModule;

	// ? build test app
	beforeAll(async () => {
		nestTestingModule = await Test.createTestingModule({
			imports: [],
			controllers: [
				DefaultController,
			],
			providers: [
				HttpConstants,
			],
			exports: [],
		})
			.overrideGuard(CustomThrottlerGuard).useValue({
				handleRequest: (...args: unknown[]): Promise<boolean> => { return Promise.resolve(true); },
			})
			.overrideProvider(HttpConstants).useValue({
				messages: {
					found: (element: string) => `${element} founded successfully.`,
				},
			})
			.compile();

		nestTestApp = nestTestingModule.createNestApplication(createNestTestApplicationOptions);
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
			expect(response.body).toEqual({
				method: 'GET',
				baseUrl: '',
				statusCode: 200,
			});
		});
	});

	afterAll(async () => {
		await nestTestApp.close();
		await nestTestingModule.close();
	});
});
