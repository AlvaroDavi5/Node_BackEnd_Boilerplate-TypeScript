import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import CoreModule from '@core/core.module';
import { createNestTestApplicationOptions, startNestApplication } from 'tests/e2e/support/mocks/setupUtils';


jest.setTimeout(1.2 * 5000);
describe('API :: UserController', () => {
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

	describe('# [GET] /api/users', () => {
		test('Success response', async () => {
			const response = await request(await nestTestApp.getHttpServer())
				.get('/api/users')
				.set('Authorization', `Bearer ${process.env.MOCKED_SERVICE_TOKEN}`);

			expect(response.statusCode).toBe(200);
			expect(response.body).toMatchObject({
				content: [
					{
						fullName: 'Tester User',
						fu: 'SP',
						docType: 'CPF',
						preference: {
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

		test('Invalid Token response', async () => {
			const response = await request(await nestTestApp.getHttpServer())
				.get('/api/users');

			expect(response.statusCode).toBe(498);
			expect(response.body).toMatchObject({
				error: 'invalidToken',
				name: 'Invalid Token',
				message: 'Authorization token is required',
				statusCode: 498,
			});
		});
	});

	describe('# [POST] /api/users', () => {
		// TODO - Success response

		test('Bad Request response', async () => {
			const response = await request(await nestTestApp.getHttpServer())
				.post('/api/users')
				.set('Authorization', `Bearer ${process.env.MOCKED_SERVICE_TOKEN}`)
				.send({
					fullName: 'Tester User',
					email: 'user.tester@nomail.com',
				});

			expect(response.statusCode).toBe(400);
			expect(response.body).toMatchObject({
				error: 'BadRequestException',
				name: 'Bad Request',
				message: [
					'password should not be empty',
					'password must be a string',
				],
				statusCode: 400,
			});
		});
	});
});
