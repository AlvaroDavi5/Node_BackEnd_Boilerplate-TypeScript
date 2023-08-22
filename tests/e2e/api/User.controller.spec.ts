import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { NestGlobalModule, startNestApplication } from '../support/mocks/nestGlobal.module';


describe('API :: UserController', () => {
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

	describe('# [GET] /api/users', () => {
		it(`Should get success`, async () => {
			return request(nestTestApp.getHttpServer())
				.get('/api/users')
				.set('Authorization', 'Bearer ' + process.env.MOCKED_SERVICE_TOKEN)
				.expect(200)
				.expect({
					content: [],
					pageNumber: 0,
					pageSize: 0,
					totalPages: 0,
					totalItems: 0,
				});
		});
	});

	afterAll(async () => {
		await nestTestApp.close();
	});
});
