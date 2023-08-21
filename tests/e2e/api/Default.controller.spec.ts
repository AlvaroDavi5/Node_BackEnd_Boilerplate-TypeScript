import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { NestGlobalModule, startNestApplication } from '../support/mocks/nestGlobal.module';


describe('API :: DefaultController', () => {
	let nestTestApp: INestApplication;

	// ? build test app
	beforeAll(async () => {
		const nestTestingModule: TestingModule = await Test.createTestingModule({
			imports: [NestGlobalModule]
		}).compile();

		nestTestApp = nestTestingModule.createNestApplication();
		await startNestApplication(nestTestApp);
		await nestTestApp.init();
	});

	describe('# [GET] /api/check', () => {
		it(`Should get success`, async () => {
			return request(nestTestApp.getHttpServer())
				.get('/api/check')
				.expect(200)
				.expect({
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
	});
});
