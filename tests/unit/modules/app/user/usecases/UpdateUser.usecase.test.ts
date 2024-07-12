import UpdateUserUseCase from '@app/user/usecases/UpdateUser.usecase';
import UserEntity, { UpdateUserInterface } from '@domain/entities/User.entity';
import UserPreferenceEntity, { UpdateUserPreferenceInterface } from '@domain/entities/UserPreference.entity';
import { ThemesEnum } from '@domain/enums/themes.enum';
import { ListQueryInterface, PaginationInterface } from '@shared/internal/interfaces/listPaginationInterface';
import { UserAuthInterface } from '@shared/internal/interfaces/userAuthInterface';
import { ErrorInterface } from '@shared/internal/interfaces/errorInterface';


describe('Modules :: App :: User :: UseCases :: UpdateUserUseCase', () => {
	// // mocks
	const exceptionsMock = {
		internal: jest.fn(({ message }: ErrorInterface): Error => (new Error(message))),
		integration: jest.fn(({ message }: ErrorInterface): Error => (new Error(message))),
		unauthorized: jest.fn(({ message }: ErrorInterface): Error => (new Error(message))),
		business: jest.fn(({ message }: ErrorInterface): Error => (new Error(message))),
		notFound: jest.fn(({ message }: ErrorInterface): Error => (new Error(message))),
		conflict: jest.fn(({ message }: ErrorInterface): Error => (new Error(message))),
	};
	const userStrategyMock = {
		isAllowedToManageUser: jest.fn((_userAgent: UserAuthInterface, _userData: UserEntity): boolean => (false)),
	};
	const userServiceMock = {
		getByEmail: jest.fn(async (_email: string): Promise<UserEntity | null> => (null)),
		getById: jest.fn(async (_id: string, _withoutPassword = true): Promise<UserEntity> => { throw new Error('GenericError'); }),
		create: jest.fn(async (_entity: UserEntity): Promise<UserEntity> => { throw new Error('GenericError'); }),
		update: jest.fn(async (_id: string, _data: UpdateUserInterface): Promise<UserEntity> => { throw new Error('GenericError'); }),
		delete: jest.fn(async (_id: string, _data: { softDelete: boolean, userAgentId?: string }): Promise<boolean> => (false)),
		list: jest.fn(async (_query: ListQueryInterface, _withoutSensibleData = true): Promise<PaginationInterface<UserEntity>> => {
			return { content: [], pageNumber: 0, pageSize: 0, totalPages: 0, totalItems: 0 };
		}),
		protectPassword: jest.fn((password: string): string => (password)),
		validatePassword: jest.fn((_entity: UserEntity, _passwordToValidate: string): void => { throw new Error('GenericError'); }),
	};
	const userPreferenceServiceMock = {
		getByUserId: jest.fn(async (_userId: string): Promise<UserPreferenceEntity> => { throw new Error('GenericError'); }),
		create: jest.fn(async (_entity: UserPreferenceEntity): Promise<UserPreferenceEntity> => { throw new Error('GenericError'); }),
		update: jest.fn(async (_id: string, _data: UpdateUserPreferenceInterface): Promise<UserPreferenceEntity> => { throw new Error('GenericError'); }),
		delete: jest.fn(async (_id: string, _data: { softDelete: boolean }): Promise<boolean> => (false)),
	};

	const userAgent = { username: 'user.test@nomail.test', clientId: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d' };
	const updateUserUseCase = new UpdateUserUseCase(
		userServiceMock as any,
		userPreferenceServiceMock as any,
		userStrategyMock as any,
		exceptionsMock as any,
	);

	describe('# Main Flux', () => {
		test('Should return updated user', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ id: 'b5483856-1bf7-4dae-9c21-d7ea4dd30d1d', userId: userEntity.getId() });
			userServiceMock.getById
				.mockResolvedValueOnce(userEntity)
				.mockResolvedValueOnce(userEntity);
			userPreferenceServiceMock.getByUserId
				.mockResolvedValueOnce(userPreferenceEntity)
				.mockResolvedValueOnce(userPreferenceEntity);
			userStrategyMock.isAllowedToManageUser.mockReturnValueOnce(true);
			userServiceMock.update.mockImplementationOnce(async (_id: string, data: UpdateUserInterface): Promise<UserEntity> => {
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
			userPreferenceServiceMock.update.mockImplementationOnce(async (_id: string, data: UpdateUserPreferenceInterface): Promise<UserPreferenceEntity> => {
				if (data.defaultTheme) userPreferenceEntity.setDefaultTheme(data.defaultTheme);
				if (data.imagePath) userPreferenceEntity.setImagePath(data.imagePath);
				return userPreferenceEntity;
			});

			const result = await updateUserUseCase.execute('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', {
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
	});

	describe('# Exceptions', () => {
		test('Should throw a conflict error', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ id: 'b5483856-1bf7-4dae-9c21-d7ea4dd30d1d', userId: userEntity.getId() });
			userServiceMock.getById.mockResolvedValueOnce(userEntity);
			userPreferenceServiceMock.getByUserId.mockResolvedValueOnce(userPreferenceEntity);
			userStrategyMock.isAllowedToManageUser.mockReturnValueOnce(true);
			userServiceMock.update.mockRejectedValueOnce(exceptionsMock.conflict({
				message: 'User not updated!',
			}));

			await expect(updateUserUseCase.execute('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', {
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

			await expect(updateUserUseCase.execute('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', {
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

			await expect(updateUserUseCase.execute('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', {
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
			await expect(updateUserUseCase.execute('', {}))
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
