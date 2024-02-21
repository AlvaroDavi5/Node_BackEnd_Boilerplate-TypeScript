import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { TestModule, startNestApplication } from '../support/mocks/nestGlobal.module';


jest.setTimeout(5000);
describe('API :: DefaultController', () => {
	let nestTestApp: INestApplication;
	let nestTestingModule: TestingModule;

	// ? build test app
	beforeAll(async () => {
		nestTestingModule = await Test.createTestingModule({
			imports: [TestModule]
		}).compile();

		nestTestApp = nestTestingModule.createNestApplication({
			abortOnError: false,
			snapshot: false,
			preview: false,
			forceCloseConnections: true,
		});
		await startNestApplication(nestTestApp);
		await nestTestApp.init();
	});

	describe('# [GET] /api/check', () => {
		test('Should get success', async () => {
			const response = await request(await nestTestApp.getHttpServer())
				.get('/api/check');

			expect(response.statusCode).toBe(200);
			expect(response.body).toEqual({
				baseUrl: '',
				method: 'GET',
				headers: {
					connection: 'close',
					host: '127.0.0.1:3000',
				},
				statusCode: 200,
				statusMessage: 'Endpoint finded successfully.',
				params: {},
				query: {},
				body: {},
				url: '/api/check'
			});
		});
	});

	afterAll(async () => {
		await nestTestApp.close();
		await nestTestingModule.close();
	});
});
