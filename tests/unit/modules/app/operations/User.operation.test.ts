import UserOperation from '../../../../../src/modules/app/user/operations/User.operation';
import UserEntity, { UpdateUserInterface } from '../../../../../src/modules/domain/entities/User.entity';
import UserPreferenceEntity, { UpdateUserPreferenceInterface } from '../../../../../src/modules/domain/entities/UserPreference.entity';
import UserStrategy from '../../../../../src/modules/app/user/strategies/User.strategy';
import HttpConstants from '../../../../../src/modules/common/constants/Http.constants';
import CryptographyService from '../../../../../src/modules/core/security/Cryptography.service';
import { configServiceMock } from '../../../../../src/dev/mocks/mockedModules';
import { ListQueryInterface, PaginationInterface } from '../../../../../src/shared/interfaces/listPaginationInterface';
import { ErrorInterface } from '../../../../../src/shared/interfaces/errorInterface';


describe('Modules :: App :: Operations :: UserOperation', () => {
	// // mocks
	const userServiceMock = {
		getByEmail: jest.fn(async (email: string): Promise<UserEntity | null> => (null)),
		getById: jest.fn(async (id: string, withoutPassword = true): Promise<UserEntity | null> => (null)),
		create: jest.fn(async (entity: UserEntity): Promise<UserEntity | null> => (null)),
		update: jest.fn(async (id: string, data: UpdateUserInterface): Promise<UserEntity | null> => (null)),
		delete: jest.fn(async (id: string, data: { softDelete: boolean, userAgentId?: string }): Promise<boolean | null> => (null)),
		list: jest.fn(async (query: ListQueryInterface, withoutSensibleData = true): Promise<PaginationInterface<UserEntity> | null> => ({ content: [], pageNumber: 0, pageSize: 0, totalPages: 0, totalItems: 0 })),
		protectPassword: jest.fn((password: string): string => (password)),
		validatePassword: jest.fn((entity: UserEntity, passwordToValidate: string): void => { return undefined; }),
	};
	const userPreferenceServiceMock = {
		getByUserId: jest.fn(async (userId: string): Promise<UserPreferenceEntity | null> => (null)),
		create: jest.fn(async (entity: UserPreferenceEntity): Promise<UserPreferenceEntity | null> => (null)),
		update: jest.fn(async (id: string, data: UpdateUserPreferenceInterface): Promise<UserPreferenceEntity | null> => (null)),
		delete: jest.fn(async (id: string, data: { softDelete: boolean }): Promise<boolean | null> => (null)),
	};
	const userStrategy = new UserStrategy();
	const httpConstants = new HttpConstants();
	const exceptionsMock = {
		integration: jest.fn(({ message }: ErrorInterface): Error => (new Error(message))),
		unauthorized: jest.fn(({ message }: ErrorInterface): Error => (new Error(message))),
		business: jest.fn(({ message }: ErrorInterface): Error => (new Error(message))),
		notFound: jest.fn(({ message }: ErrorInterface): Error => (new Error(message))),
		conflict: jest.fn(({ message }: ErrorInterface): Error => (new Error(message))),
	};

	const userAgent = { username: 'user.test@nomail.test', clientId: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d' };
	const userOperation = new UserOperation(userServiceMock, userPreferenceServiceMock, new CryptographyService(configServiceMock as any), userStrategy, httpConstants, exceptionsMock);

	describe('# User Login', () => {
		test('Should validate password', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test', password: 'admin' });
			userServiceMock.getByEmail.mockImplementation(async (email: string): Promise<UserEntity | null> => {
				if (email === userEntity.getLogin().email) return userEntity;
				else return null;
			});
			userServiceMock.validatePassword.mockImplementation((entity: UserEntity, passwordToValidate: string): void => {
				if (!entity.getPassword()?.length)
					throw exceptionsMock.business({
						message: 'Invalid password',
					});
				if (passwordToValidate !== entity.getPassword())
					throw exceptionsMock.unauthorized({
						message: 'Password hash is different from database',
					});
			});
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: string): Promise<UserPreferenceEntity | null> => (new UserPreferenceEntity({ userId })));

			const loggedUser = await userOperation.loginUser({ email: 'user.test@nomail.test', password: 'admin' });
			expect(userServiceMock.getByEmail).toHaveBeenCalledTimes(1);
			expect(userServiceMock.validatePassword).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledTimes(1);
			expect(loggedUser.user.getLogin().email).toBe('user.test@nomail.test');
			expect(loggedUser.user.getPassword()).toBe('');
		});

		test('Should not validate password', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test', password: 'admin' });
			userServiceMock.getByEmail.mockImplementation(async (email: string): Promise<UserEntity | null> => {
				if (email === userEntity.getLogin().email) return userEntity;
				else return null;
			});
			userServiceMock.validatePassword.mockImplementation((entity: UserEntity, passwordToValidate: string): void => {
				if (!entity.getPassword()?.length)
					throw exceptionsMock.business({
						message: 'Invalid password',
					});
				if (passwordToValidate !== entity.getPassword())
					throw exceptionsMock.unauthorized({
						message: 'Password hash is different from database',
					});
			});
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: string): Promise<UserPreferenceEntity | null> => (new UserPreferenceEntity({ userId })));

			try {
				await userOperation.loginUser({ email: 'user.test@nomail.test', password: 'test' });
			} catch (error) {
				expect(userServiceMock.getByEmail).toHaveBeenCalledTimes(1);
				expect(userServiceMock.validatePassword).toHaveBeenCalledWith(userEntity, 'test');
				expect(exceptionsMock.unauthorized).toHaveBeenCalledWith({
					message: 'Password hash is different from database'
				});
				expect(userPreferenceServiceMock.getByUserId).not.toHaveBeenCalled();
			}
		});

		test('Should throw a not found error', async () => {
			userServiceMock.getByEmail.mockImplementation(async (email: string): Promise<UserEntity | null> => (null));

			try {
				await userOperation.loginUser({ email: 'user.test@nomail.test', password: 'admin' });
			} catch (error) {
				expect(userServiceMock.getByEmail).toHaveBeenCalledTimes(1);
				expect(exceptionsMock.notFound).toHaveBeenCalledWith({
					message: 'User not found!'
				});
				expect(userServiceMock.validatePassword).not.toHaveBeenCalled();
				expect(userPreferenceServiceMock.getByUserId).not.toHaveBeenCalled();
			}
		});
	});

	describe('# List Users', () => {
		test('Should list users', async () => {
			const listData: ListQueryInterface = {
				limit: 15,
				page: 0,
			};
			const listResult = {
				content: [
					new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user1@nomail.test' }),
					new UserEntity({ id: 'b5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user2@nomail.test' }),
					new UserEntity({ id: 3, email: 'user3@nomail.test' }),
				],
				pageNumber: 0,
				pageSize: 3,
				totalPages: 1,
				totalItems: 3,
			};
			userServiceMock.list.mockImplementation(async (query: ListQueryInterface, withoutSensibleData = true): Promise<PaginationInterface<UserEntity> | null> => (listResult));

			const listedUsers = await userOperation.listUsers(listData);
			expect(userServiceMock.list).toHaveBeenCalledTimes(1);
			expect(userServiceMock.list).toHaveBeenCalledWith(listData);
			expect(listedUsers.totalItems).toBe(listResult.totalItems);
			expect(listedUsers.content).toEqual(listResult.content);
		});

		test('Should throw a integration error', async () => {
			const listData: ListQueryInterface = {
				limit: 15,
				page: 0,
			};
			userServiceMock.list.mockImplementation(async (query: ListQueryInterface, withoutSensibleData = true): Promise<PaginationInterface<UserEntity> | null> => (null));

			try {
				await userOperation.listUsers(listData);
			} catch (error) {
				expect(userServiceMock.list).toHaveBeenCalledTimes(1);
				expect(userServiceMock.list).toHaveBeenCalledWith(listData);
				expect(exceptionsMock.integration).toHaveBeenCalledWith({
					message: 'Error to connect database'
				});
			}
		});
	});

	describe('# Create User', () => {
		test('Should return created user', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			userServiceMock.create.mockImplementation(async (entity: UserEntity): Promise<UserEntity | null> => (entity));
			userServiceMock.getById.mockImplementation(async (id: string, withoutPassword = true): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});
			userPreferenceServiceMock.create.mockImplementation(async (entity: UserPreferenceEntity): Promise<UserPreferenceEntity | null> => (entity));
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: string): Promise<UserPreferenceEntity | null> => (new UserPreferenceEntity({ userId })));

			const createdUser = await userOperation.createUser(userEntity.getAttributes(), userAgent);
			expect(userServiceMock.create).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.create).toHaveBeenCalledTimes(1);
			expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledTimes(1);
			expect(createdUser?.getId()).toBe(userEntity.getId());
			expect(createdUser?.getLogin()?.email).toBe(userEntity.getLogin().email);
			expect(createdUser?.getPassword()).toBeNull();
		});

		test('Should throw a not found error', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			userServiceMock.create.mockImplementation(async (entity: UserEntity): Promise<UserEntity | null> => (entity));
			userServiceMock.getById.mockImplementation(async (id: string, withoutPassword = true): Promise<UserEntity | null> => (null));
			userPreferenceServiceMock.create.mockImplementation(async (entity: UserPreferenceEntity): Promise<UserPreferenceEntity | null> => (entity));
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: string): Promise<UserPreferenceEntity | null> => (null));

			try {
				await userOperation.createUser(userEntity.getAttributes(), userAgent);
			} catch (error) {
				expect(userServiceMock.create).toHaveBeenCalledTimes(1);
				expect(userPreferenceServiceMock.create).toHaveBeenCalledTimes(1);
				expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
				expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledTimes(1);
				expect(exceptionsMock.notFound).toHaveBeenCalledWith({
					message: 'Created user not found!'
				});
			}
		});

		test('Should throw a conflict error', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			userServiceMock.create.mockImplementation(async (entity: UserEntity): Promise<UserEntity | null> => (null));
			userPreferenceServiceMock.create.mockImplementation(async (entity: UserPreferenceEntity): Promise<UserPreferenceEntity | null> => (null));

			try {
				await userOperation.createUser(userEntity.getAttributes(), userAgent);
			} catch (error) {
				expect(userServiceMock.create).toHaveBeenCalledTimes(1);
				expect(userPreferenceServiceMock.create).not.toHaveBeenCalled();
				expect(exceptionsMock.conflict).toHaveBeenCalledWith({
					message: 'User not created!'
				});
			}
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
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ userId: userEntity.getId() });
			userServiceMock.getById.mockImplementation(async (id: string, withoutPassword = true): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: string): Promise<UserPreferenceEntity | null> => {
				if (userId === userEntity.getId()) return userPreferenceEntity;
				else return null;
			});

			const foundedUser = await userOperation.getUser('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', userAgent);
			expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
			expect(userServiceMock.getById).toHaveBeenCalledWith('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', true);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledWith('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d');
			expect(foundedUser?.getId()).toBe(userEntity.getId());
			expect(foundedUser?.getLogin()?.email).toBe(userEntity.getLogin().email);
		});

		test('Should return a null preference', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			userServiceMock.getById.mockImplementation(async (id: string, withoutPassword = true): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: string): Promise<UserPreferenceEntity | null> => (null));

			const foundedUser = await userOperation.getUser('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', userAgent);
			expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
			expect(userServiceMock.getById).toHaveBeenCalledWith('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', true);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledWith('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d');
			expect(foundedUser?.getPreference()).toBeNull();
		});

		test('Should throw a conflict error', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ userId: userEntity.getId() });
			userServiceMock.getById.mockImplementation(async (id: string, withoutPassword = true): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: string): Promise<UserPreferenceEntity | null> => {
				if (userId === userEntity.getId()) return userPreferenceEntity;
				else return null;
			});

			try {
				await userOperation.getUser('', userAgent);
			} catch (error) {
				expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
				expect(userServiceMock.getById).toHaveBeenCalledWith('', true);
				expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledTimes(1);
				expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledWith('');
				expect(exceptionsMock.notFound).toHaveBeenCalledWith({
					message: 'User not found!'
				});
			}
		});

		test('Should throw a unauthorized error', async () => {
			try {
				await userOperation.getUser('', null);
			} catch (error) {
				expect(exceptionsMock.unauthorized).toHaveBeenCalledWith({
					message: 'Invalid userAgent'
				});
			}
		});
	});

	describe('# Update User', () => {
		test('Should return updated user', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ id: 'b5483856-1bf7-4dae-9c21-d7ea4dd30d1d', userId: userEntity.getId() });
			userServiceMock.getById.mockImplementation(async (id: string, withoutPassword = true): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: string): Promise<UserPreferenceEntity | null> => {
				if (userId === userEntity.getId()) return userPreferenceEntity;
				else return null;
			});
			userServiceMock.update.mockImplementation(async (id: string, data: UpdateUserInterface): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) {
					if (data.email) userEntity.setLogin(data.email, userEntity.getLogin().fullName as string);
					if (data.password) userEntity.setPhone(data.password);
					if (data.fullName) userEntity.setLogin(userEntity.getLogin().email as string, data.fullName);
					if (data.phone) userEntity.setPhone(data.phone);
					if (data.document) userEntity.setDocInfos(data.document, userEntity.getDocInfos().docType as string, userEntity.getDocInfos().fu as string);
					if (data.docType) userEntity.setDocInfos(userEntity.getDocInfos().document as string, data.docType, userEntity.getDocInfos().fu as string);
					if (data.fu) userEntity.setDocInfos(userEntity.getDocInfos().document as string, userEntity.getDocInfos().docType as string, data.fu);
					if (data.preference) userEntity.setPreference(new UserPreferenceEntity(data.preference));
					if (data.deletedBy) userEntity.setDeletedBy(data.deletedBy);

					return userEntity;
				}
				else return null;
			});
			userPreferenceServiceMock.update.mockImplementation(async (id: string, data: UpdateUserPreferenceInterface): Promise<UserPreferenceEntity | null> => {
				if (id === userPreferenceEntity.getId()) {
					if (data.defaultTheme) userPreferenceEntity.setDefaultTheme(data.defaultTheme);
					if (data.imagePath) userPreferenceEntity.setImagePath(data.imagePath);

					return userPreferenceEntity;
				}
				else return null;
			});

			const updatedUser = await userOperation.updateUser('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', { phone: '+55999999999', preference: { defaultTheme: 'DEFAULT' } }, userAgent);
			expect(userServiceMock.getById).toHaveBeenCalledTimes(2);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledTimes(2);
			expect(userServiceMock.update).toHaveBeenCalledWith('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', { phone: '+55999999999', preference: { defaultTheme: 'DEFAULT' } });
			expect(userPreferenceServiceMock.update).toHaveBeenCalledWith('b5483856-1bf7-4dae-9c21-d7ea4dd30d1d', { defaultTheme: 'DEFAULT' });
			expect(updatedUser?.getPhone()).toEqual('+55999999999');
			expect(updatedUser?.getPreference()?.getDefaultTheme()).toEqual('DEFAULT');
		});

		test('Should throw a conflict error', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ id: 'b5483856-1bf7-4dae-9c21-d7ea4dd30d1d', userId: userEntity.getId() });
			userServiceMock.getById.mockImplementation(async (id: string, withoutPassword = true): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: string): Promise<UserPreferenceEntity | null> => {
				if (userId === userEntity.getId()) return userPreferenceEntity;
				else return null;
			});

			try {
				await userOperation.updateUser('', {}, userAgent);
			} catch (error) {
				expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
				expect(userServiceMock.getById).toHaveBeenCalledWith('', true);
				expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledTimes(1);
				expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledWith('');
				expect(exceptionsMock.notFound).toHaveBeenCalledWith({
					message: 'User or preference not found!'
				});
			}
		});

		test('Should throw a business error', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ id: 'b5483856-1bf7-4dae-9c21-d7ea4dd30d1d', userId: userEntity.getId() });
			const otherUserAgent = { username: 'test', clientId: '1' };
			userServiceMock.getById.mockImplementation(async (id: string, withoutPassword = true): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: string): Promise<UserPreferenceEntity | null> => {
				if (userId === userEntity.getId()) return userPreferenceEntity;
				else return null;
			});

			try {
				await userOperation.updateUser('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', {}, otherUserAgent);
			} catch (error) {
				expect(exceptionsMock.business).toHaveBeenCalledWith({
					message: 'userAgent not allowed to update this user!'
				});
			}
		});

		test('Should throw a conflict error', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ id: 'b5483856-1bf7-4dae-9c21-d7ea4dd30d1d', userId: userEntity.getId() });
			userServiceMock.getById.mockImplementation(async (id: string, withoutPassword = true): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});
			userServiceMock.update.mockImplementation(async (id: string, data: UpdateUserInterface): Promise<UserEntity | null> => (null));
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: string): Promise<UserPreferenceEntity | null> => {
				if (userId === userEntity.getId()) return userPreferenceEntity;
				else return null;
			});

			try {
				await userOperation.updateUser('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', {}, userAgent);
			} catch (error) {
				expect(exceptionsMock.conflict).toHaveBeenCalledWith({
					message: 'User or preference not updated!'
				});
			}
		});

		test('Should throw a unauthorized error', async () => {
			try {
				await userOperation.updateUser('', {}, null);
			} catch (error) {
				expect(exceptionsMock.unauthorized).toHaveBeenCalledWith({
					message: 'Invalid userAgent'
				});
			}
		});
	});

	describe('# Delete User', () => {
		test('Should return deleted user', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ id: 'b5483856-1bf7-4dae-9c21-d7ea4dd30d1d', userId: userEntity.getId() });
			userServiceMock.getById.mockImplementation(async (id: string, withoutPassword = true): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: string): Promise<UserPreferenceEntity | null> => {
				if (userId === userEntity.getId()) return userPreferenceEntity;
				else return null;
			});
			userServiceMock.delete.mockImplementation(async (id: string, data: { softDelete: boolean, userAgentId?: string }): Promise<boolean | null> => {
				if (id === userEntity.getId()) return true;
				else return null;
			});
			userPreferenceServiceMock.delete.mockImplementation(async (id: string, data: { softDelete: boolean }): Promise<boolean | null> => {
				if (id === userPreferenceEntity.getId()) return true;
				else return null;
			});

			const deletedUser = await userOperation.deleteUser('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', userAgent);
			expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.delete).toHaveBeenCalledWith('b5483856-1bf7-4dae-9c21-d7ea4dd30d1d', { softDelete: true });
			expect(userServiceMock.delete).toHaveBeenCalledWith('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', { softDelete: true, userAgentId: userAgent.clientId });
			expect(deletedUser).toEqual(true);
		});

		test('Should throw a not found error', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ userId: userEntity.getId() });
			userServiceMock.getById.mockImplementation(async (id: string, withoutPassword = true): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: string): Promise<UserPreferenceEntity | null> => {
				if (userId === userEntity.getId()) return userPreferenceEntity;
				else return null;
			});

			try {
				await userOperation.deleteUser('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', userAgent);
			} catch (error) {
				expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
				expect(userServiceMock.getById).toHaveBeenCalledWith('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', true);
				expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledTimes(1);
				expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledWith('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d');
				expect(exceptionsMock.notFound).toHaveBeenCalledWith({
					message: 'User or preference not found!'
				});
			}
		});

		test('Should throw a unauthorized error', async () => {
			try {
				await userOperation.deleteUser('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', null);
			} catch (error) {
				expect(exceptionsMock.unauthorized).toHaveBeenCalledWith({
					message: 'Invalid userAgent'
				});
			}
		});

		test('Should throw a business error', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ id: 'b5483856-1bf7-4dae-9c21-d7ea4dd30d1d', userId: userEntity.getId() });
			const otherUserAgent = { username: 'test', clientId: '1' };
			userServiceMock.getById.mockImplementation(async (id: string, withoutPassword = true): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: string): Promise<UserPreferenceEntity | null> => {
				if (userId === userEntity.getId()) return userPreferenceEntity;
				else return null;
			});

			try {
				await userOperation.deleteUser('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', otherUserAgent);
			} catch (error) {
				expect(exceptionsMock.business).toHaveBeenCalledWith({
					message: 'userAgent not allowed to delete this user!'
				});
			}
		});

		test('Should throw a conflict error', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ id: 'b5483856-1bf7-4dae-9c21-d7ea4dd30d1d', userId: userEntity.getId() });
			userServiceMock.getById.mockImplementation(async (id: string, withoutPassword = true): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: string): Promise<UserPreferenceEntity | null> => {
				if (userId === userEntity.getId()) return userPreferenceEntity;
				else return null;
			});
			userServiceMock.delete.mockImplementation(async (id: string, data: { softDelete: boolean, userAgentId?: string }): Promise<boolean | null> => (null));
			userPreferenceServiceMock.delete.mockImplementation(async (id: string, data: { softDelete: boolean }): Promise<boolean | null> => {
				if (id === userPreferenceEntity.getId()) return true;
				else return null;
			});

			try {
				await userOperation.deleteUser('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', userAgent);
			} catch (error) {
				expect(exceptionsMock.conflict).toHaveBeenCalledWith({
					message: 'User not deleted!'
				});
			}
		});
	});

});
