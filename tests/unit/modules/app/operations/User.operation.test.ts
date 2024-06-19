import UserOperation from '@app/user/operations/User.operation';
import UserEntity, { UpdateUserInterface } from '@domain/entities/User.entity';
import UserPreferenceEntity, { UpdateUserPreferenceInterface } from '@domain/entities/UserPreference.entity';
import UserStrategy from '@app/user/strategies/User.strategy';
import HttpConstants from '@common/constants/Http.constants';
import { ListQueryInterface, PaginationInterface } from '@shared/internal/interfaces/listPaginationInterface';
import { ErrorInterface } from '@shared/internal/interfaces/errorInterface';
import { ThemesEnum } from '@domain/enums/themes.enum';


describe('Modules :: App :: User :: Operations :: UserOperation', () => {
	// // mocks
	const exceptionsMock = {
		internal: jest.fn(({ message }: ErrorInterface): Error => (new Error(message))),
		integration: jest.fn(({ message }: ErrorInterface): Error => (new Error(message))),
		unauthorized: jest.fn(({ message }: ErrorInterface): Error => (new Error(message))),
		business: jest.fn(({ message }: ErrorInterface): Error => (new Error(message))),
		notFound: jest.fn(({ message }: ErrorInterface): Error => (new Error(message))),
		conflict: jest.fn(({ message }: ErrorInterface): Error => (new Error(message))),
	};
	const userServiceMock = {
		getByEmail: jest.fn(async (email: string): Promise<UserEntity | null> => (null)),
		getById: jest.fn(async (id: string, withoutPassword = true): Promise<UserEntity> => { throw new Error('GenericError'); }),
		create: jest.fn(async (entity: UserEntity): Promise<UserEntity> => { throw new Error('GenericError'); }),
		update: jest.fn(async (id: string, data: UpdateUserInterface): Promise<UserEntity> => { throw new Error('GenericError'); }),
		delete: jest.fn(async (id: string, data: { softDelete: boolean, userAgentId?: string }): Promise<boolean> => (false)),
		list: jest.fn(async (query: ListQueryInterface, withoutSensibleData = true): Promise<PaginationInterface<UserEntity>> => {
			return { content: [], pageNumber: 0, pageSize: 0, totalPages: 0, totalItems: 0 };
		}),
		protectPassword: jest.fn((password: string): string => (password)),
		validatePassword: jest.fn((entity: UserEntity, passwordToValidate: string): void => { throw new Error('GenericError'); }),
	};
	const userPreferenceServiceMock = {
		getByUserId: jest.fn(async (userId: string): Promise<UserPreferenceEntity> => { throw new Error('GenericError'); }),
		create: jest.fn(async (entity: UserPreferenceEntity): Promise<UserPreferenceEntity> => { throw new Error('GenericError'); }),
		update: jest.fn(async (id: string, data: UpdateUserPreferenceInterface): Promise<UserPreferenceEntity> => { throw new Error('GenericError'); }),
		delete: jest.fn(async (id: string, data: { softDelete: boolean }): Promise<boolean> => (false)),
	};
	const cryptographyServiceMock = {
		encodeJwt: jest.fn((payload: any, inputEncoding: BufferEncoding, expiration?: string): string => ('')),
	};

	const userAgent = { username: 'user.test@nomail.test', clientId: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d' };
	const userOperation = new UserOperation(
		userServiceMock as any,
		userPreferenceServiceMock as any,
		cryptographyServiceMock as any,
		new UserStrategy(),
		new HttpConstants(),
		exceptionsMock as any,
	);

	describe('# User Login', () => {
		test('Should validate password', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test', password: 'admin' });
			userServiceMock.getById.mockResolvedValueOnce(userEntity);
			userServiceMock.getByEmail.mockResolvedValueOnce(userEntity);
			userServiceMock.validatePassword.mockImplementationOnce((entity: UserEntity, passwordToValidate: string) => { return undefined; });
			userPreferenceServiceMock.getByUserId.mockResolvedValueOnce(new UserPreferenceEntity({ userId: userEntity.getId() }));
			cryptographyServiceMock.encodeJwt.mockReturnValueOnce('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXIuZGVmYXVsdEBub21haWwuZGV2IiwiY2xpZW50SWQiOiIxODZlN2RhYS1kMmRmLTQ0YWYtYmE4Yy00ZjIwNDM1NmQwZjkiLCJpYXQiOjE3MTgxNTY2MjQsImV4cCI6MTcxODI0MzAyNH0.4gmn_kp7YaZq4XGvKxe2i6QgWZh-f2iNaJg40md6agQ');

			const result = await userOperation.loginUser({ email: 'user.test@nomail.test', password: 'admin' });
			expect(userServiceMock.getByEmail).toHaveBeenCalledTimes(1);
			expect(userServiceMock.getByEmail).toHaveBeenCalledWith('user.test@nomail.test');
			expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
			expect(userServiceMock.getById).toHaveBeenCalledWith('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', false);
			expect(userServiceMock.validatePassword).toHaveBeenCalledTimes(1);
			expect(userServiceMock.validatePassword).toHaveBeenCalledWith(userEntity, 'admin');
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledWith('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d');
			expect(cryptographyServiceMock.encodeJwt).toHaveBeenCalledTimes(1);
			expect(cryptographyServiceMock.encodeJwt).toHaveBeenCalledWith({ clientId: userEntity.getId(), username: userEntity.getEmail() }, 'utf8', '1d');
			expect(result.token).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXIuZGVmYXVsdEBub21haWwuZGV2IiwiY2xpZW50SWQiOiIxODZlN2RhYS1kMmRmLTQ0YWYtYmE4Yy00ZjIwNDM1NmQwZjkiLCJpYXQiOjE3MTgxNTY2MjQsImV4cCI6MTcxODI0MzAyNH0.4gmn_kp7YaZq4XGvKxe2i6QgWZh-f2iNaJg40md6agQ');
			expect(result.user.getEmail()).toBe('user.test@nomail.test');
			expect(result.user.getPassword()).toBe('');
		});

		test('Should not validate password', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test', password: 'admin' });
			userServiceMock.getById.mockResolvedValueOnce(userEntity);
			userServiceMock.getByEmail.mockResolvedValueOnce(userEntity);
			userServiceMock.validatePassword.mockImplementationOnce((entity: UserEntity, passwordToValidate: string) => {
				throw exceptionsMock.unauthorized({
					message: 'Password hash is different from database',
				});
			});

			await expect(userOperation.loginUser({ email: 'user.test@nomail.test', password: 'admin' }))
				.rejects.toMatchObject(new Error('Password hash is different from database'));
			expect(userServiceMock.getByEmail).toHaveBeenCalledTimes(1);
			expect(userServiceMock.getByEmail).toHaveBeenCalledWith('user.test@nomail.test');
			expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
			expect(userServiceMock.getById).toHaveBeenCalledWith('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', false);
			expect(userServiceMock.validatePassword).toHaveBeenCalledTimes(1);
			expect(userServiceMock.validatePassword).toHaveBeenCalledWith(userEntity, 'admin');
			expect(userPreferenceServiceMock.getByUserId).not.toHaveBeenCalled();
			expect(cryptographyServiceMock.encodeJwt).not.toHaveBeenCalled();
		});

		test('Should throw a not found error', async () => {
			userServiceMock.getByEmail.mockResolvedValueOnce(null);

			await expect(userOperation.loginUser({ email: 'user.test@nomail.test', password: 'admin' }))
				.rejects.toMatchObject(new Error('User not founded by e-mail!'));
			expect(userServiceMock.getByEmail).toHaveBeenCalledTimes(1);
			expect(userServiceMock.getByEmail).toHaveBeenCalledWith('user.test@nomail.test');
			expect(exceptionsMock.notFound).toHaveBeenCalledWith({
				message: 'User not founded by e-mail!'
			});
			expect(userServiceMock.validatePassword).not.toHaveBeenCalled();
			expect(userPreferenceServiceMock.getByUserId).not.toHaveBeenCalled();
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
					new UserEntity({ id: 'c5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user3@nomail.test' }),
				],
				pageNumber: 0,
				pageSize: 3,
				totalPages: 1,
				totalItems: 3,
			};
			userServiceMock.list.mockResolvedValueOnce(listResult);

			const result = await userOperation.listUsers(listData);
			expect(userServiceMock.list).toHaveBeenCalledTimes(1);
			expect(userServiceMock.list).toHaveBeenCalledWith(listData);
			expect(result.totalItems).toBe(listResult.totalItems);
			expect(result.content).toEqual(listResult.content);
		});
	});

	describe('# Create User', () => {
		test('Should return created user', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ userId: userEntity.getId() });
			userEntity.setPreference(userPreferenceEntity);
			userServiceMock.getByEmail.mockResolvedValueOnce(null);
			userServiceMock.create.mockResolvedValueOnce(userEntity);
			userPreferenceServiceMock.create.mockResolvedValueOnce(userPreferenceEntity);
			userServiceMock.getById.mockResolvedValueOnce(userEntity);
			userPreferenceServiceMock.getByUserId.mockResolvedValueOnce(userPreferenceEntity);

			const result = await userOperation.createUser(userEntity.getAttributes(), userAgent);
			expect(userServiceMock.create).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.create).toHaveBeenCalledTimes(1);
			expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
			expect(userServiceMock.getById).toHaveBeenCalledWith('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', true);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledWith('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d');
			expect(result?.getId()).toBe(userEntity.getId());
			expect(result?.getEmail()).toBe(userEntity.getEmail());
			expect(result?.getPassword()).toBeUndefined();
		});

		test('Should throw a not found error', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ userId: userEntity.getId() });
			userEntity.setPreference(userPreferenceEntity);
			userServiceMock.getByEmail.mockResolvedValueOnce(null);
			userServiceMock.create.mockResolvedValueOnce(userEntity);
			userPreferenceServiceMock.create.mockResolvedValueOnce(userPreferenceEntity);
			userServiceMock.getById.mockRejectedValueOnce(exceptionsMock.notFound({
				message: 'User not founded by ID!',
			}));

			await expect(userOperation.createUser(userEntity.getAttributes(), userAgent))
				.rejects.toMatchObject(new Error('User not founded by ID!'));
			expect(userServiceMock.create).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.create).toHaveBeenCalledTimes(1);
			expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
			expect(userServiceMock.getById).toHaveBeenCalledWith('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', true);
			expect(userPreferenceServiceMock.getByUserId).not.toHaveBeenCalled();
			expect(exceptionsMock.notFound).toHaveBeenCalledWith({
				message: 'User not founded by ID!'
			});
		});

		test('Should throw a conflict error', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			userServiceMock.getByEmail.mockResolvedValueOnce(userEntity);

			await expect(userOperation.createUser(userEntity.getAttributes(), userAgent))
				.rejects.toMatchObject(new Error('User already exists!'));
			expect(userServiceMock.create).not.toHaveBeenCalled();
			expect(userPreferenceServiceMock.create).not.toHaveBeenCalled();
			expect(userServiceMock.getById).not.toHaveBeenCalled();
			expect(userPreferenceServiceMock.getByUserId).not.toHaveBeenCalled();
			expect(exceptionsMock.conflict).toHaveBeenCalledWith({
				message: 'User already exists!'
			});
		});

		test('Should throw a unauthorized error', async () => {
			await expect(userOperation.createUser({} as any))
				.rejects.toMatchObject(new Error('Invalid userAgent'));
			expect(exceptionsMock.unauthorized).toHaveBeenCalledWith({
				message: 'Invalid userAgent'
			});
		});
	});

	describe('# Get User', () => {
		test('Should return finded user', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ userId: userEntity.getId() });
			userServiceMock.getById.mockResolvedValueOnce(userEntity);
			userPreferenceServiceMock.getByUserId.mockResolvedValueOnce(userPreferenceEntity);

			const result = await userOperation.getUser('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', userAgent);
			expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
			expect(userServiceMock.getById).toHaveBeenCalledWith('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', true);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledWith('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d');
			expect(result?.getId()).toBe(userEntity.getId());
			expect(result?.getEmail()).toBe(userEntity.getEmail());
		});

		test('Should throw a not found error', async () => {
			userServiceMock.getById.mockRejectedValueOnce(exceptionsMock.notFound({
				message: 'User not founded by ID!',
			}));

			await expect(userOperation.getUser('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', userAgent))
				.rejects.toMatchObject(new Error('User not founded by ID!'));
			expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.getByUserId).not.toHaveBeenCalled();
			expect(exceptionsMock.notFound).toHaveBeenCalledWith({
				message: 'User not founded by ID!'
			});
		});

		test('Should throw a unauthorized error', async () => {
			await expect(userOperation.getUser(''))
				.rejects.toMatchObject(new Error('Invalid userAgent'));
			expect(exceptionsMock.unauthorized).toHaveBeenCalledWith({
				message: 'Invalid userAgent'
			});
		});
	});

	describe('# Update User', () => {
		test('Should return updated user', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ id: 'b5483856-1bf7-4dae-9c21-d7ea4dd30d1d', userId: userEntity.getId() });
			userServiceMock.getById
				.mockResolvedValueOnce(userEntity)
				.mockResolvedValueOnce(userEntity);
			userPreferenceServiceMock.getByUserId
				.mockResolvedValueOnce(userPreferenceEntity)
				.mockResolvedValueOnce(userPreferenceEntity);
			userServiceMock.update.mockImplementationOnce(async (id: string, data: UpdateUserInterface): Promise<UserEntity> => {
				if (data.email) userEntity.setEmail(data.email);
				if (data.password) userEntity.setPhone(data.password);
				if (data.fullName) userEntity.setFullName(data.fullName);
				if (data.phone) userEntity.setPhone(data.phone);
				if (data.document) userEntity.setDocInfos(data.document, userEntity.getDocInfos().docType as string, userEntity.getDocInfos().fu as string);
				if (data.docType) userEntity.setDocInfos(userEntity.getDocInfos().document as string, data.docType, userEntity.getDocInfos().fu as string);
				if (data.fu) userEntity.setDocInfos(userEntity.getDocInfos().document as string, userEntity.getDocInfos().docType as string, data.fu);
				if (data.preference) userEntity.setPreference(new UserPreferenceEntity(data.preference));
				if (data.deletedBy) userEntity.setDeletedBy(data.deletedBy);
				return userEntity;
			});
			userPreferenceServiceMock.update.mockImplementationOnce(async (id: string, data: UpdateUserPreferenceInterface): Promise<UserPreferenceEntity> => {
				if (data.defaultTheme) userPreferenceEntity.setDefaultTheme(data.defaultTheme);
				if (data.imagePath) userPreferenceEntity.setImagePath(data.imagePath);
				return userPreferenceEntity;
			});

			const result = await userOperation.updateUser('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', {
				phone: '+55999999999',
				preference: { defaultTheme: ThemesEnum.DEFAULT }
			}, userAgent);
			expect(userServiceMock.getById).toHaveBeenCalledTimes(2);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledTimes(2);
			expect(userServiceMock.update).toHaveBeenCalledWith('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', {
				phone: '+55999999999',
				preference: { defaultTheme: 'DEFAULT' },
			});
			expect(userPreferenceServiceMock.update).toHaveBeenCalledWith('b5483856-1bf7-4dae-9c21-d7ea4dd30d1d', {
				defaultTheme: 'DEFAULT',
			});
			expect(result?.getPhone()).toEqual('+55999999999');
			expect(result?.getPreference()?.getDefaultTheme()).toEqual('DEFAULT');
		});

		test('Should throw a conflict error', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ id: 'b5483856-1bf7-4dae-9c21-d7ea4dd30d1d', userId: userEntity.getId() });
			userServiceMock.getById.mockResolvedValueOnce(userEntity);
			userPreferenceServiceMock.getByUserId.mockResolvedValueOnce(userPreferenceEntity);
			userServiceMock.update.mockRejectedValueOnce(exceptionsMock.conflict({
				message: 'User not updated!',
			}));

			await expect(userOperation.updateUser('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', {
				phone: '+55999999999',
				preference: { defaultTheme: ThemesEnum.DEFAULT }
			}, userAgent))
				.rejects.toMatchObject(new Error('User not updated!'));
			expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledTimes(1);
			expect(userServiceMock.update).toHaveBeenCalledWith('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', {
				phone: '+55999999999',
				preference: { defaultTheme: 'DEFAULT' }
			});
			expect(userPreferenceServiceMock.update).not.toHaveBeenCalled();
			expect(exceptionsMock.conflict).toHaveBeenCalledWith({
				message: 'User not updated!'
			});
		});

		test('Should throw a business error', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ id: 'b5483856-1bf7-4dae-9c21-d7ea4dd30d1d', userId: userEntity.getId() });
			const otherUserAgent = { username: 'test', clientId: '1' };
			userServiceMock.getById.mockResolvedValueOnce(userEntity);
			userPreferenceServiceMock.getByUserId.mockResolvedValueOnce(userPreferenceEntity);

			await expect(userOperation.updateUser('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', {
				phone: '+55999999999',
				preference: { defaultTheme: ThemesEnum.DEFAULT }
			}, otherUserAgent))
				.rejects.toMatchObject(new Error('userAgent not allowed to update this user!'));
			expect(exceptionsMock.business).toHaveBeenCalledWith({
				message: 'userAgent not allowed to update this user!'
			});
		});

		test('Should throw a not found error', async () => {
			userServiceMock.getById.mockRejectedValueOnce(exceptionsMock.notFound({
				message: 'User not founded by ID!',
			}));

			await expect(userOperation.updateUser('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', {
				phone: '+55999999999',
				preference: { defaultTheme: ThemesEnum.DEFAULT }
			}, userAgent))
				.rejects.toMatchObject(new Error('User not founded by ID!'));
			expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
			expect(userServiceMock.getById).toHaveBeenCalledWith('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', true);
			expect(userPreferenceServiceMock.getByUserId).not.toHaveBeenCalled();
			expect(exceptionsMock.notFound).toHaveBeenCalledWith({
				message: 'User not founded by ID!'
			});
		});

		test('Should throw a unauthorized error', async () => {
			await expect(userOperation.updateUser('', {}))
				.rejects.toMatchObject(new Error('Invalid userAgent'));
			expect(exceptionsMock.unauthorized).toHaveBeenCalledWith({
				message: 'Invalid userAgent'
			});
		});
	});

	describe('# Delete User', () => {
		test('Should return deleted user', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ id: 'b5483856-1bf7-4dae-9c21-d7ea4dd30d1d', userId: userEntity.getId() });
			userServiceMock.getById.mockResolvedValueOnce(userEntity);
			userPreferenceServiceMock.getByUserId.mockResolvedValueOnce(userPreferenceEntity);
			userPreferenceServiceMock.delete.mockResolvedValueOnce(true);
			userServiceMock.delete.mockResolvedValueOnce(true);

			const result = await userOperation.deleteUser('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', userAgent);
			expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
			expect(userServiceMock.getById).toHaveBeenCalledWith('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', true);
			expect(userServiceMock.delete).toHaveBeenCalledTimes(1);
			expect(userServiceMock.delete).toHaveBeenCalledWith('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', { softDelete: true, userAgentId: userAgent.clientId });
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledWith('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d');
			expect(userPreferenceServiceMock.delete).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.delete).toHaveBeenCalledWith('b5483856-1bf7-4dae-9c21-d7ea4dd30d1d', { softDelete: true });
			expect(result).toEqual(true);
		});

		test('Should return not deleted user', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ id: 'b5483856-1bf7-4dae-9c21-d7ea4dd30d1d', userId: userEntity.getId() });
			userServiceMock.getById.mockResolvedValueOnce(userEntity);
			userPreferenceServiceMock.getByUserId.mockResolvedValueOnce(userPreferenceEntity);
			userPreferenceServiceMock.delete.mockResolvedValueOnce(false);
			userServiceMock.delete.mockResolvedValueOnce(false);

			const result = await userOperation.deleteUser('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', userAgent);
			expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
			expect(userServiceMock.getById).toHaveBeenCalledWith('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', true);
			expect(userServiceMock.delete).toHaveBeenCalledTimes(1);
			expect(userServiceMock.delete).toHaveBeenCalledWith('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', { softDelete: true, userAgentId: userAgent.clientId });
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledWith('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d');
			expect(userPreferenceServiceMock.delete).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.delete).toHaveBeenCalledWith('b5483856-1bf7-4dae-9c21-d7ea4dd30d1d', { softDelete: true });
			expect(result).toEqual(false);
		});

		test('Should throw a business error', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ id: 'b5483856-1bf7-4dae-9c21-d7ea4dd30d1d', userId: userEntity.getId() });
			const otherUserAgent = { username: 'test', clientId: '1' };
			userServiceMock.getById.mockResolvedValueOnce(userEntity);
			userPreferenceServiceMock.getByUserId.mockResolvedValueOnce(userPreferenceEntity);

			await expect(userOperation.deleteUser('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', otherUserAgent))
				.rejects.toMatchObject(new Error('userAgent not allowed to delete this user!'));
			expect(exceptionsMock.business).toHaveBeenCalledWith({
				message: 'userAgent not allowed to delete this user!'
			});
		});

		test('Should throw a not found error', async () => {
			userServiceMock.getById.mockRejectedValueOnce(exceptionsMock.notFound({
				message: 'User not founded by ID!',
			}));

			await expect(userOperation.deleteUser('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', userAgent))
				.rejects.toMatchObject(new Error('User not founded by ID!'));
			expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
			expect(userServiceMock.getById).toHaveBeenCalledWith('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', true);
			expect(userPreferenceServiceMock.getByUserId).not.toHaveBeenCalled();
			expect(exceptionsMock.notFound).toHaveBeenCalledWith({
				message: 'User not founded by ID!'
			});
		});

		test('Should throw a unauthorized error', async () => {
			await expect(userOperation.deleteUser('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d'))
				.rejects.toMatchObject(new Error('Invalid userAgent'));
			expect(exceptionsMock.unauthorized).toHaveBeenCalledWith({
				message: 'Invalid userAgent'
			});
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});
});
