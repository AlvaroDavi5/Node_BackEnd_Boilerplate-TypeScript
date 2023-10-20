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
		test('Should get success', async () => {
			const response = await request(await nestTestApp.getHttpServer())
				.get('/api/users')
				.set('Authorization', 'Bearer ' + process.env.MOCKED_SERVICE_TOKEN);

			expect(response.statusCode).toBe(200);
			expect(response.body).toEqual({
				content: [],
				pageNumber: 0,
				pageSize: 0,
				totalPages: 0,
				totalItems: 0,
			});
		});

		test('Should get unauthorized', async () => {
			const response = await request(await nestTestApp.getHttpServer())
				.get('/api/users');

			expect(response.statusCode).toBe(401);
			expect(response.body).toEqual({
				error: 'Unauthorized',
				message: 'Authorization token is required',
				statusCode: 401,
			});
		});
	});

	afterAll(async () => {
		await nestTestApp.close();
	});
});
