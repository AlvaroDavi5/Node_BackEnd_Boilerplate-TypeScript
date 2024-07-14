import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import Exceptions from '@core/errors/Exceptions';
import { REQUEST_LOGGER_PROVIDER } from '@core/logging/Logger.service';
import CustomThrottlerGuard from '@api/guards/Throttler.guard';
import AuthGuard from '@api/guards/Auth.guard';
import UserController from '@app/user/api/controllers/User.controller';
import LoginUserUseCase from '@app/user/usecases/LoginUser.usecase';
import ListUsersUseCase from '@app/user/usecases/ListUsers.usecase';
import CreateUserUseCase from '@app/user/usecases/CreateUser.usecase';
import GetUserUseCase from '@app/user/usecases/GetUser.usecase';
import UpdateUserUseCase from '@app/user/usecases/UpdateUser.usecase';
import DeleteUserUseCase from '@app/user/usecases/DeleteUser.usecase';
import UserEntity from '@domain/entities/User.entity';
import UserListEntity from '@domain/entities/generic/UserList.entity';
import { createNestTestApplicationOptions, startNestApplication } from 'tests/integration/support/mocks/setupUtils';
import LoggerService from 'tests/integration/support/mocks/logging/Logger.service';
import { ListQueryInterface } from '@shared/internal/interfaces/listPaginationInterface';


describe('Modules :: App :: User :: API :: UserController', () => {
	let nestTestApp: INestApplication;
	let nestTestingModule: TestingModule;
	// // mocks
	const customThrottlerGuardMock = {
		handleRequest: jest.fn((..._args: unknown[]): Promise<boolean> => { return Promise.resolve(true); }),
	};
	const authGuardMock = {
		canActivate: jest.fn((_context: unknown): boolean => { return true; }),
	};
	const listUsersUseCaseMock = {
		execute: jest.fn((_query: ListQueryInterface): Promise<UserListEntity> => { throw new Error('GenericError'); }),
	};
	const exceptions = new Exceptions();

	// ? build test app
	beforeAll(async () => {
		nestTestingModule = await Test.createTestingModule({
			imports: [],
			controllers: [
				UserController,
			],
			providers: [
				LoginUserUseCase,
				ListUsersUseCase,
				CreateUserUseCase,
				GetUserUseCase,
				UpdateUserUseCase,
				DeleteUserUseCase,
				{
					provide: REQUEST_LOGGER_PROVIDER,
					useValue: new LoggerService(),
				},
			],
			exports: [],
		})
			.overrideGuard(CustomThrottlerGuard).useValue(customThrottlerGuardMock)
			.overrideGuard(AuthGuard).useValue(authGuardMock)
			.overrideProvider(LoginUserUseCase).useValue({})
			.overrideProvider(ListUsersUseCase).useValue(listUsersUseCaseMock)
			.overrideProvider(CreateUserUseCase).useValue({})
			.overrideProvider(GetUserUseCase).useValue({})
			.overrideProvider(UpdateUserUseCase).useValue({})
			.overrideProvider(DeleteUserUseCase).useValue({})
			.overrideProvider(REQUEST_LOGGER_PROVIDER).useValue(new LoggerService())
			.compile();

		nestTestApp = nestTestingModule.createNestApplication(createNestTestApplicationOptions);
		await startNestApplication(nestTestApp);
		await nestTestApp.init();
	});

	describe('# [GET] /api/users', () => {
		test('Success response', async () => {
			listUsersUseCaseMock.execute.mockResolvedValueOnce({
				content: [
					new UserEntity({
						fullName: 'Tester User',
						fu: 'SP',
						docType: 'CPF',
						document: '12312312345',
						preference: {
							defaultTheme: 'DARK',
							imagePath: './generic.png',
						},
					}),
				],
				pageNumber: 0,
				pageSize: 1,
				totalPages: 1,
				totalItems: 1,
			});

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
						document: '12312312345',
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
			authGuardMock.canActivate.mockImplementationOnce(() => {
				throw exceptions.invalidToken({
					message: 'Authorization token is required',
				});
			});

			const response = await request(await nestTestApp.getHttpServer())
				.get('/api/users');

			expect(response.statusCode).toBe(498);
			expect(response.body).toEqual({
				error: 'Invalid Token',
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
			expect(response.body).toEqual({
				error: 'Bad Request',
				message: [
					'password should not be empty',
					'password must be a string',
				],
				statusCode: 400,
			});
		});
	});

	afterAll(async () => {
		await nestTestApp.close();
		await nestTestingModule.close();
	});
});
