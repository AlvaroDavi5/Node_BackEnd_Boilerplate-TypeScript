import UserOperation from '../../../../../src/modules/app/operations/User.operation';
import UserEntity, { UserInterface } from '../../../../../src/modules/app/domain/entities/User.entity';
import UserPreferenceEntity, { UserPreferenceInterface } from '../../../../../src/modules/app/domain/entities/UserPreference.entity';
import UserStrategy from '../../../../../src/modules/app/strategies/User.strategy';


describe('Modules :: App :: Operations :: UserOperation', () => {
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
	const userStrategy = new UserStrategy();
	const exceptionsMock = {
		unauthorized: jest.fn(({ message }: any): Error => (new Error(message))),
		business: jest.fn(({ message }: any): Error => (new Error(message))),
		notFound: jest.fn(({ message }: any): Error => (new Error(message))),
	};

	beforeEach(() => {
		userOperation = new UserOperation(userServiceMock, userPreferenceServiceMock, userStrategy, exceptionsMock);
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
			userServiceMock.getById.mockImplementation(async (id: number): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});
			userPreferenceServiceMock.create.mockImplementation(async (entity: UserPreferenceEntity): Promise<UserPreferenceEntity | null> => (entity));
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: number): Promise<UserPreferenceEntity | null> => (new UserPreferenceEntity({ userId })));

			const createdUser = await userOperation.createUser(userEntity.getAttributes(), userAgent);
			expect(userServiceMock.create).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.create).toHaveBeenCalledTimes(1);
			expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
			expect(await userServiceMock.getById(1)).toBe(userEntity);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledTimes(1);
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

		test('Should throw a unauthorized error', async () => {
			try {
				await userOperation.createUser({}, null);
			} catch (error) {
				expect(exceptionsMock.unauthorized).toHaveBeenCalledWith({
					message: 'Invalid userAgent'
				});
			}
		});
	});

	describe('# Get User', () => {

		test('Should return finded user', async () => {
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ userId: userEntity.getId() });
			const userAgent = { username: 'tester', clientId: '#1' };
			userServiceMock.getById.mockImplementation(async (id: number): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: number): Promise<UserPreferenceEntity | null> => {
				if (userId === userEntity.getId()) return userPreferenceEntity;
				else return null;
			});

			const foundedUser = await userOperation.getUser(1, userAgent);
			expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
			expect(userServiceMock.getById).toHaveBeenCalledWith(1);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledWith(1);
			expect(foundedUser?.getId()).toBe(userEntity.getId());
			expect(foundedUser?.getLogin()?.email).toBe(userEntity.getLogin().email);
		});

		test('Should return a null preference', async () => {
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test' });
			const userAgent = { username: 'tester', clientId: '#1' };
			userServiceMock.getById.mockImplementation(async (id: number): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: number): Promise<UserPreferenceEntity | null> => (null));

			const foundedUser = await userOperation.getUser(1, userAgent);
			expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
			expect(userServiceMock.getById).toHaveBeenCalledWith(1);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledWith(1);
			expect(foundedUser?.getPreference()).toBeNull();
		});

		test('Should throw a conflict error', async () => {
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ userId: userEntity.getId() });
			const userAgent = { username: 'tester', clientId: '#1' };
			userServiceMock.getById.mockImplementation(async (id: number): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: number): Promise<UserPreferenceEntity | null> => {
				if (userId === userEntity.getId()) return userPreferenceEntity;
				else return null;
			});

			try {
				await userOperation.getUser(0, userAgent);
			} catch (error) {
				expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
				expect(userServiceMock.getById).toHaveBeenCalledWith(0);
				expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledTimes(1);
				expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledWith(0);
				expect(exceptionsMock.notFound).toHaveBeenCalledWith({
					message: 'User not found!'
				});
			}
		});

		test('Should throw a unauthorized error', async () => {
			try {
				await userOperation.getUser(0, null);
			} catch (error) {
				expect(exceptionsMock.unauthorized).toHaveBeenCalledWith({
					message: 'Invalid userAgent'
				});
			}
		});
	});

	describe('# Update User', () => {

		test('Should return updated user', async () => {
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ id: 2, userId: userEntity.getId() });
			const userAgent = { username: 'user.test@nomail.test', clientId: '#1' };
			userServiceMock.getById.mockImplementation(async (id: number): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: number): Promise<UserPreferenceEntity | null> => {
				if (userId === userEntity.getId()) return userPreferenceEntity;
				else return null;
			});
			userServiceMock.update.mockImplementation(async (id: number, data: UserInterface): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return new UserEntity({ ...userEntity.getAttributes(), ...data });
				else return null;
			});
			userPreferenceServiceMock.update.mockImplementation(async (id: number, data: UserPreferenceInterface): Promise<UserPreferenceEntity | null> => {
				if (id === userPreferenceEntity.getId()) return new UserPreferenceEntity({ ...userPreferenceEntity.getAttributes(), ...data });
				else return null;
			});

			const deletedUser = await userOperation.updateUser(1, { phone: '+55999999999' }, userAgent);
			expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.update).toHaveBeenCalledWith(2, { phone: '+55999999999' });
			expect(userServiceMock.update).toHaveBeenCalledWith(1, { phone: '+55999999999' });
			expect(deletedUser?.getPhone()).toEqual('+55999999999');
		});

		test('Should throw a conflict error', async () => {
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ id: 2, userId: userEntity.getId() });
			const userAgent = { username: 'tester', clientId: '#1' };
			userServiceMock.getById.mockImplementation(async (id: number): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: number): Promise<UserPreferenceEntity | null> => {
				if (userId === userEntity.getId()) return userPreferenceEntity;
				else return null;
			});

			try {
				await userOperation.updateUser(0, {}, userAgent);
			} catch (error) {
				expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
				expect(userServiceMock.getById).toHaveBeenCalledWith(0);
				expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledTimes(1);
				expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledWith(0);
				expect(exceptionsMock.notFound).toHaveBeenCalledWith({
					message: 'User or preference not found!'
				});
			}
		});

		test('Should throw a unauthorized error', async () => {
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ id: 2, userId: userEntity.getId() });
			const userAgent = { username: 'test', clientId: '#1' };
			userServiceMock.getById.mockImplementation(async (id: number): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: number): Promise<UserPreferenceEntity | null> => {
				if (userId === userEntity.getId()) return userPreferenceEntity;
				else return null;
			});

			try {
				await userOperation.updateUser(1, {}, userAgent);
			} catch (error) {
				expect(exceptionsMock.business).toHaveBeenCalledWith({
					message: 'userAgent not allowed to execute this action'
				});
			}
		});

		test('Should throw a unauthorized error', async () => {
			try {
				await userOperation.updateUser(0, {}, null);
			} catch (error) {
				expect(exceptionsMock.unauthorized).toHaveBeenCalledWith({
					message: 'Invalid userAgent'
				});
			}
		});
	});

	describe('# Delete User', () => {

		test('Should return deleted user', async () => {
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ id: 2, userId: userEntity.getId() });
			const userAgent = { username: 'user.test@nomail.test', clientId: '#1' };
			userServiceMock.getById.mockImplementation(async (id: number): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: number): Promise<UserPreferenceEntity | null> => {
				if (userId === userEntity.getId()) return userPreferenceEntity;
				else return null;
			});
			userServiceMock.delete.mockImplementation(async (id: number, data: { softDelete: boolean, userAgentId?: string }): Promise<[affectedCount: number] | null | undefined> => {
				if (id === userEntity.getId()) return [1];
				else return null;
			});
			userPreferenceServiceMock.delete.mockImplementation(async (id: number, data: { softDelete: boolean }): Promise<[affectedCount: number] | null | undefined> => {
				if (id === userPreferenceEntity.getId()) return [1];
				else return null;
			});

			const deletedUser = await userOperation.deleteUser(1, userAgent);
			expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.delete).toHaveBeenCalledWith(2, { softDelete: true });
			expect(userServiceMock.delete).toHaveBeenCalledWith(1, { softDelete: true, userAgentId: userAgent.username });
			expect(deletedUser).toEqual([1]);
		});

		test('Should throw a conflict error', async () => {
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ userId: userEntity.getId() });
			const userAgent = { username: 'tester', clientId: '#1' };
			userServiceMock.getById.mockImplementation(async (id: number): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: number): Promise<UserPreferenceEntity | null> => {
				if (userId === userEntity.getId()) return userPreferenceEntity;
				else return null;
			});

			try {
				await userOperation.deleteUser(0, userAgent);
			} catch (error) {
				expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
				expect(userServiceMock.getById).toHaveBeenCalledWith(0);
				expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledTimes(1);
				expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledWith(0);
				expect(exceptionsMock.notFound).toHaveBeenCalledWith({
					message: 'User or preference not found!'
				});
			}
		});

		test('Should throw a unauthorized error', async () => {
			try {
				await userOperation.deleteUser(0, null);
			} catch (error) {
				expect(exceptionsMock.unauthorized).toHaveBeenCalledWith({
					message: 'Invalid userAgent'
				});
			}
		});
	});

});
