import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import CoreModule from '../../../src/core.module';


describe('API :: DefaultController', () => {
	let nestTestApp: INestApplication;
	let appRequest: request.SuperTest<request.Test>;

	// ? build test app
	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [CoreModule],
		}).compile();
		nestTestApp = moduleFixture.createNestApplication();
		await nestTestApp.init();

		// * build app request
		appRequest = request(nestTestApp.getHttpServer());
	});

	describe('# [GET] /api/healthcheck', () => {
		it('Should get success', async () => {
			const response = await appRequest.get('/api/healthcheck');

			expect(response.statusCode).toBe(200);
			expect(response.body).toEqual({
				method: 'GET',
				url: '/api/healthcheck',
				statusCode: 200,
				status: 'OK'
			});
		});
	});
});
