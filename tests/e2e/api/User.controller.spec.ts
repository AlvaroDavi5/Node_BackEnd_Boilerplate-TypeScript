import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { createNestApplicationOptions, startNestApplication } from '../support/mocks/setupUtils';
import CoreModule from '../../../src/modules/core/core.module';


jest.setTimeout(1.2 * 5000);
describe('API :: UserController', () => {
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

	describe('# [GET] /api/users', () => {
		test('Should get success', async () => {
			const response = await request(await nestTestApp.getHttpServer())
				.get('/api/users')
				.set('Authorization', 'Bearer ' + process.env.MOCKED_SERVICE_TOKEN);

			expect(response.statusCode).toBe(200);
			expect(response.body).toMatchObject({
				content: [
					{
						id: 1,
						fullName: 'Tester',
						fu: 'BA',
						docType: 'invalid',
						preference: {
							id: 1,
							userId: 1,
							defaultTheme: 'DARK',
							imagePath: './generic.png',
						},
					},
				],
				pageNumber: 0,
				pageSize: 1,
				totalPages: 1,
				totalItems: 1,
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
		await nestTestingModule.close();
	});
});
