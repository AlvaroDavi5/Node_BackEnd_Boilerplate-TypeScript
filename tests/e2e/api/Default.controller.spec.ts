import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { NestGlobalModule, startNestApplication } from '../support/mocks/nestGlobal.module';


describe('API :: DefaultController', () => {
	let nestTestApp: INestApplication;
	let nestTestingModule: TestingModule;

	// ? build test app
	beforeAll(async () => {
		nestTestingModule = await Test.createTestingModule({
			imports: [NestGlobalModule]
		}).compile();

		nestTestApp = nestTestingModule.createNestApplication();
		await startNestApplication(nestTestApp);
		await nestTestApp.init();
	});

	describe('# [GET] /api/check', () => {
		it('Should get success', async () => {
			const response = await request(await nestTestApp.getHttpServer())
				.get('/api/check');

			expect(response.statusCode).toBe(200);
			expect(response.body).toEqual({
				baseUrl: '',
				method: 'GET',
				statusCode: 200,
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
