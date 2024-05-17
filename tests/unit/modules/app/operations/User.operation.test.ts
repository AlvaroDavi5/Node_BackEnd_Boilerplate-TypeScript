import UserOperation from '../../../../../src/modules/app/user/operations/User.operation';
import UserEntity from '../../../../../src/modules/domain/entities/User.entity';
import UserPreferenceEntity from '../../../../../src/modules/domain/entities/UserPreference.entity';
import UserStrategy from '../../../../../src/modules/app/user/strategies/User.strategy';
import CryptographyService from '../../../../../src/modules/core/security/Cryptography.service';
import { configServiceMock } from '../../../../../src/dev/mocks/mockedModules';
import { ListQueryInterface, PaginationInterface } from '../../../../../src/shared/interfaces/listPaginationInterface';
import { ErrorInterface } from '../../../../../src/shared/interfaces/errorInterface';


describe('Modules :: App :: Operations :: UserOperation', () => {
	// // mocks
	const userServiceMock = {
		getByEmail: jest.fn(async (email: string): Promise<UserEntity | null> => (null)),
		getById: jest.fn(async (id: number, withoutPassword = true): Promise<UserEntity | null> => (null)),
		create: jest.fn(async (entity: UserEntity): Promise<UserEntity | null> => (null)),
		update: jest.fn(async (id: number, entity: UserEntity): Promise<UserEntity | null> => (null)),
		delete: jest.fn(async (id: number, data: { softDelete: boolean, userAgentId?: string }): Promise<boolean | null> => (null)),
		list: jest.fn(async (query: ListQueryInterface, withoutSensibleData = true): Promise<PaginationInterface<UserEntity> | null> => ({ content: [], pageNumber: 0, pageSize: 0, totalPages: 0, totalItems: 0 })),
		protectPassword: jest.fn((password: string): string => (password)),
		validatePassword: jest.fn((entity: UserEntity, passwordToValidate: string): void => { return undefined; }),
	};
	const userPreferenceServiceMock = {
		getByUserId: jest.fn(async (userId: number): Promise<UserPreferenceEntity | null> => (null)),
		create: jest.fn(async (entity: UserPreferenceEntity): Promise<UserPreferenceEntity | null> => (null)),
		update: jest.fn(async (id: number, entity: UserPreferenceEntity): Promise<UserPreferenceEntity | null> => (null)),
		delete: jest.fn(async (id: number, data: { softDelete: boolean }): Promise<boolean | null> => (null)),
	};
	const userStrategy = new UserStrategy();
	const exceptionsMock = {
		integration: jest.fn(({ message }: ErrorInterface): Error => (new Error(message))),
		unauthorized: jest.fn(({ message }: ErrorInterface): Error => (new Error(message))),
		business: jest.fn(({ message }: ErrorInterface): Error => (new Error(message))),
		notFound: jest.fn(({ message }: ErrorInterface): Error => (new Error(message))),
		conflict: jest.fn(({ message }: ErrorInterface): Error => (new Error(message))),
	};

	const createdAt = new Date();
	const userAgent = { username: 'user.test@nomail.test', clientId: '1' };
	const userOperation = new UserOperation(userServiceMock, userPreferenceServiceMock, new CryptographyService(configServiceMock as any), userStrategy, exceptionsMock);

	describe('# User Login', () => {
		test('Should validate password', async () => {
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test', password: 'admin' });
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
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: number): Promise<UserPreferenceEntity | null> => (new UserPreferenceEntity({ userId })));

			const loggedUser = await userOperation.loginUser({ email: 'user.test@nomail.test', password: 'admin' });
			expect(userServiceMock.getByEmail).toHaveBeenCalledTimes(1);
			expect(userServiceMock.validatePassword).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledTimes(1);
			expect(loggedUser.user.getLogin().email).toBe('user.test@nomail.test');
			expect(loggedUser.user.getPassword()).toBe('');
		});

		test('Should not validate password', async () => {
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test', password: 'admin' });
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
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: number): Promise<UserPreferenceEntity | null> => (new UserPreferenceEntity({ userId })));

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
					new UserEntity({ id: 1, email: 'user1@nomail.test' }),
					new UserEntity({ id: 2, email: 'user2@nomail.test' }),
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
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test' });
			userServiceMock.create.mockImplementation(async (entity: UserEntity): Promise<UserEntity | null> => (entity));
			userServiceMock.getById.mockImplementation(async (id: number, withoutPassword = true): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});
			userPreferenceServiceMock.create.mockImplementation(async (entity: UserPreferenceEntity): Promise<UserPreferenceEntity | null> => (entity));
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: number): Promise<UserPreferenceEntity | null> => (new UserPreferenceEntity({ userId })));

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
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test' });
			userServiceMock.create.mockImplementation(async (entity: UserEntity): Promise<UserEntity | null> => (entity));
			userServiceMock.getById.mockImplementation(async (id: number, withoutPassword = true): Promise<UserEntity | null> => (null));
			userPreferenceServiceMock.create.mockImplementation(async (entity: UserPreferenceEntity): Promise<UserPreferenceEntity | null> => (entity));
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: number): Promise<UserPreferenceEntity | null> => (null));

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
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test' });
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
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ userId: userEntity.getId() });
			userServiceMock.getById.mockImplementation(async (id: number, withoutPassword = true): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: number): Promise<UserPreferenceEntity | null> => {
				if (userId === userEntity.getId()) return userPreferenceEntity;
				else return null;
			});

			const foundedUser = await userOperation.getUser(1, userAgent);
			expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
			expect(userServiceMock.getById).toHaveBeenCalledWith(1, true);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledWith(1);
			expect(foundedUser?.getId()).toBe(userEntity.getId());
			expect(foundedUser?.getLogin()?.email).toBe(userEntity.getLogin().email);
		});

		test('Should return a null preference', async () => {
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test' });
			userServiceMock.getById.mockImplementation(async (id: number, withoutPassword = true): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: number): Promise<UserPreferenceEntity | null> => (null));

			const foundedUser = await userOperation.getUser(1, userAgent);
			expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
			expect(userServiceMock.getById).toHaveBeenCalledWith(1, true);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledWith(1);
			expect(foundedUser?.getPreference()).toBeNull();
		});

		test('Should throw a conflict error', async () => {
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ userId: userEntity.getId() });
			userServiceMock.getById.mockImplementation(async (id: number, withoutPassword = true): Promise<UserEntity | null> => {
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
				expect(userServiceMock.getById).toHaveBeenCalledWith(0, true);
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
			userServiceMock.getById.mockImplementation(async (id: number, withoutPassword = true): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: number): Promise<UserPreferenceEntity | null> => {
				if (userId === userEntity.getId()) return userPreferenceEntity;
				else return null;
			});
			userServiceMock.update.mockImplementation(async (id: number, entity: UserEntity): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) {
					const attributes = entity.getAttributes();

					userEntity.setLogin(attributes.email ?? '', attributes.fullName ?? '');
					userEntity.setDocInfos(attributes.document ?? '', attributes.docType ?? '', attributes.fu ?? '');
					userEntity.setPhone(attributes.phone ?? '');
					userEntity.setPreference(attributes.preference);
					userEntity.setDeletedBy(attributes.deletedBy ?? '');

					return userEntity;
				}
				else return null;
			});
			userPreferenceServiceMock.update.mockImplementation(async (id: number, entity: UserPreferenceEntity): Promise<UserPreferenceEntity | null> => {
				if (id === userPreferenceEntity.getId()) {
					const attributes = entity.getAttributes();

					userPreferenceEntity.setUserId(attributes.userId ?? 0);
					userPreferenceEntity.setDefaultTheme(attributes.defaultTheme ?? 'DEFAULT');
					userPreferenceEntity.setImagePath(attributes.imagePath ?? './image.png');

					return userPreferenceEntity;
				}
				else return null;
			});

			const updatedUser = await userOperation.updateUser(1, { phone: '+55999999999', createdAt }, userAgent);
			expect(userServiceMock.getById).toHaveBeenCalledTimes(2);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledTimes(2);
			expect(userPreferenceServiceMock.update).toHaveBeenCalledWith(2, new UserPreferenceEntity({ userId: 1, phone: '+55999999999', createdAt }));
			expect(userServiceMock.update).toHaveBeenCalledWith(1, new UserEntity({ email: 'user.test@nomail.test', phone: '+55999999999', createdAt }));
			expect(updatedUser?.getPhone()).toEqual('+55999999999');
			expect(updatedUser?.getPassword()).toBeNull();
		});

		test('Should throw a conflict error', async () => {
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ id: 2, userId: userEntity.getId() });
			userServiceMock.getById.mockImplementation(async (id: number, withoutPassword = true): Promise<UserEntity | null> => {
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
				expect(userServiceMock.getById).toHaveBeenCalledWith(0, true);
				expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledTimes(1);
				expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledWith(0);
				expect(exceptionsMock.notFound).toHaveBeenCalledWith({
					message: 'User or preference not found!'
				});
			}
		});

		test('Should throw a business error', async () => {
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ id: 2, userId: userEntity.getId() });
			const otherUserAgent = { username: 'test', clientId: '1' };
			userServiceMock.getById.mockImplementation(async (id: number, withoutPassword = true): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: number): Promise<UserPreferenceEntity | null> => {
				if (userId === userEntity.getId()) return userPreferenceEntity;
				else return null;
			});

			try {
				await userOperation.updateUser(1, {}, otherUserAgent);
			} catch (error) {
				expect(exceptionsMock.business).toHaveBeenCalledWith({
					message: 'userAgent not allowed to update this user!'
				});
			}
		});

		test('Should throw a conflict error', async () => {
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ id: 2, userId: userEntity.getId() });
			userServiceMock.getById.mockImplementation(async (id: number, withoutPassword = true): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});
			userServiceMock.update.mockImplementation(async (id: number, entity: UserEntity): Promise<UserEntity | null> => (null));
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: number): Promise<UserPreferenceEntity | null> => {
				if (userId === userEntity.getId()) return userPreferenceEntity;
				else return null;
			});

			try {
				await userOperation.updateUser(1, {}, userAgent);
			} catch (error) {
				expect(exceptionsMock.conflict).toHaveBeenCalledWith({
					message: 'User or preference not updated!'
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
			userServiceMock.getById.mockImplementation(async (id: number, withoutPassword = true): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: number): Promise<UserPreferenceEntity | null> => {
				if (userId === userEntity.getId()) return userPreferenceEntity;
				else return null;
			});
			userServiceMock.delete.mockImplementation(async (id: number, data: { softDelete: boolean, userAgentId?: string }): Promise<boolean | null> => {
				if (id === userEntity.getId()) return true;
				else return null;
			});
			userPreferenceServiceMock.delete.mockImplementation(async (id: number, data: { softDelete: boolean }): Promise<boolean | null> => {
				if (id === userPreferenceEntity.getId()) return true;
				else return null;
			});

			const deletedUser = await userOperation.deleteUser(1, userAgent);
			expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.delete).toHaveBeenCalledWith(2, { softDelete: true });
			expect(userServiceMock.delete).toHaveBeenCalledWith(1, { softDelete: true, userAgentId: userAgent.clientId });
			expect(deletedUser).toEqual(true);
		});

		test('Should throw a not found error', async () => {
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ userId: userEntity.getId() });
			userServiceMock.getById.mockImplementation(async (id: number, withoutPassword = true): Promise<UserEntity | null> => {
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
				expect(userServiceMock.getById).toHaveBeenCalledWith(0, true);
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

		test('Should throw a business error', async () => {
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ id: 2, userId: userEntity.getId() });
			const otherUserAgent = { username: 'test', clientId: '1' };
			userServiceMock.getById.mockImplementation(async (id: number, withoutPassword = true): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: number): Promise<UserPreferenceEntity | null> => {
				if (userId === userEntity.getId()) return userPreferenceEntity;
				else return null;
			});

			try {
				await userOperation.deleteUser(1, otherUserAgent);
			} catch (error) {
				expect(exceptionsMock.business).toHaveBeenCalledWith({
					message: 'userAgent not allowed to delete this user!'
				});
			}
		});

		test('Should throw a conflict error', async () => {
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ id: 2, userId: userEntity.getId() });
			userServiceMock.getById.mockImplementation(async (id: number, withoutPassword = true): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});
			userPreferenceServiceMock.getByUserId.mockImplementation(async (userId: number): Promise<UserPreferenceEntity | null> => {
				if (userId === userEntity.getId()) return userPreferenceEntity;
				else return null;
			});
			userServiceMock.delete.mockImplementation(async (id: number, data: { softDelete: boolean, userAgentId?: string }): Promise<boolean | null> => (null));
			userPreferenceServiceMock.delete.mockImplementation(async (id: number, data: { softDelete: boolean }): Promise<boolean | null> => {
				if (id === userPreferenceEntity.getId()) return true;
				else return null;
			});

			try {
				await userOperation.deleteUser(1, userAgent);
			} catch (error) {
				expect(exceptionsMock.conflict).toHaveBeenCalledWith({
					message: 'User not deleted!'
				});
			}
		});
	});

});
