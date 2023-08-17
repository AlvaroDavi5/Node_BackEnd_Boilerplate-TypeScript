import { Test, TestingModule } from '@nestjs/testing';
import UserOperation from './User.operation';
import UserEntity, { UserInterface } from '../../app/domain/entities/User.entity';
import UserPreferenceEntity, { UserPreferenceInterface } from '../../app/domain/entities/UserPreference.entity';
import UserService from '../../app/services/User.service';
import UserPreferenceService from '../../app/services/UserPreference.service';
import UserStrategy from '../../app/strategies/User.strategy';
import Exceptions from '../../../infra/errors/Exceptions';


describe('Modules :: App :: Operations :: UserOperation', () => {
	let nestTestApp: TestingModule;

	let userOperation: UserOperation;
	// // mocks
	const userServiceMock = {
		getById: jest.fn(async (id: number): Promise<UserEntity | null> => (null)),
		create: jest.fn(async (entity: UserEntity): Promise<UserEntity | null> => (null)),
		update: jest.fn(async (id: number, data: UserInterface): Promise<UserEntity | null> => (null)),
		delete: jest.fn(async (id: number, data: { softDelete: boolean, userAgentId?: string }): Promise<[affectedCount: number] | null | undefined> => (null)),
		list: jest.fn(async (data: any): Promise<any> => ({ content: [], pageNumber: 0, pageSize: 0, totalPages: 0, totalItems: 0 })),
	};
	const userPreferenceServiceMock = {
		getByUserId: jest.fn(async (userId: number): Promise<UserPreferenceEntity | null> => (null)),
		create: jest.fn(async (data: UserPreferenceEntity): Promise<UserPreferenceEntity | null> => (null)),
		update: jest.fn(async (id: number, data: UserPreferenceInterface): Promise<UserPreferenceEntity | null> => (null)),
		delete: jest.fn(async (id: number, data: { softDelete: boolean }): Promise<[affectedCount: number] | null | undefined> => (null)),
	};
	const userStrategyMock = {
		isAllowed: jest.fn((userData: any, userAgent: any): boolean => { return userData && userAgent; }),
	};
	const exceptionsMock = {
		unauthorized: jest.fn(({ message }: any): Error => (new Error(message))),
		conflict: jest.fn(({ message }: any): Error => (new Error(message))),
	};

	// ? build test app
	beforeEach(async () => {
		nestTestApp = await Test.createTestingModule({
			providers: [
				UserOperation,
				{ provide: UserService, useValue: userServiceMock },
				{ provide: UserPreferenceService, useValue: userPreferenceServiceMock },
				{ provide: UserStrategy, useValue: userStrategyMock },
				{ provide: Exceptions, useValue: exceptionsMock },
			],
		}).compile();

		// * get app provider
		userOperation = nestTestApp.get<UserOperation>(UserOperation);
	});

	afterEach(() => {
		nestTestApp.close();
	});

	describe('# List Users', () => {

		test('Should list users', async () => {
			const listData = {
				size: 15,
				page: 0,
				limit: 5,
			};
			const listResult = {
				content: [
					new UserEntity({ id: 1, email: 'user1@nomail.test' }),
					new UserEntity({ id: 2, email: 'user2@nomail.test' }),
					new UserEntity({ id: 3, email: 'user3@nomail.test' }),
				],
				pageNumber: 0,
				pageSize: 3,
				totalPages: 1,
				totalItems: 3,
			};
			userServiceMock.list.mockImplementation(async (data: any): Promise<any> => (listResult));

			const listedUsers = await userOperation.listUsers(listData);
			expect(userServiceMock.list).toHaveBeenCalledTimes(1);
			expect(userServiceMock.list).toHaveBeenCalledWith(listData);
			expect(listedUsers.totalItems).toBe(listResult.totalItems);
			expect(listedUsers.content).toEqual(listResult.content);
		});
	});

	describe('# Create User', () => {

		test('Should return created user', async () => {
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test' });
			const userAgent = { username: 'tester', clientId: '#1' };
			userServiceMock.create.mockImplementation(async (entity: UserEntity): Promise<UserEntity | null> => (entity));
			userPreferenceServiceMock.create.mockImplementation(async (entity: UserPreferenceEntity): Promise<UserPreferenceEntity | null> => (entity));
			userServiceMock.getById.mockImplementation(async (id: number): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});

			const createdUser = await userOperation.createUser(userEntity.getAttributes(), userAgent);
			expect(userServiceMock.create).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.create).toHaveBeenCalledTimes(1);
			expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
			expect(createdUser?.getId()).toBe(userEntity.getId());
			expect(createdUser?.getLogin()?.email).toBe(userEntity.getLogin().email);
		});

		test('Should return null', async () => {
			const userAgent = { username: 'tester', clientId: '#1' };
			userServiceMock.getById.mockImplementation(async (id: number): Promise<UserEntity | null> => {
				if (id) return new UserEntity({ id: 1, email: 'user.test@nomail.test' });
				else return null;
			});

			const createdUser = await userOperation.createUser({}, userAgent);
			expect(userServiceMock.create).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.create).not.toHaveBeenCalled();
			expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
			expect(createdUser?.getId()).toBeUndefined();
			expect(createdUser?.getLogin()?.email).toBeUndefined();
		});

		test('Should throw a error', async () => {
			try {
				await userOperation.createUser({}, null);
			} catch (error) {
				expect(exceptionsMock.unauthorized).toHaveBeenCalledTimes(1);
			}
		});
	});

});
