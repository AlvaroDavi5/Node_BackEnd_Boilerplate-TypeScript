import DeleteUserUseCase from '@app/user/usecases/DeleteUser.usecase';
import UserEntity, { UpdateUserInterface } from '@domain/entities/User.entity';
import UserPreferenceEntity, { UpdateUserPreferenceInterface } from '@domain/entities/UserPreference.entity';
import { UserAuthInterface } from '@shared/internal/interfaces/userAuthInterface';
import { ListQueryInterface, PaginationInterface } from '@shared/internal/interfaces/listPaginationInterface';
import { ErrorInterface } from '@shared/internal/interfaces/errorInterface';


describe('Modules :: App :: User :: UseCases :: DeleteUserUseCase', () => {
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
		isAllowedToManageUser: jest.fn((userAgent: UserAuthInterface, userData: UserEntity): boolean => (false)),
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

	const userAgent = { username: 'user.test@nomail.test', clientId: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d' };
	const deleteUserUseCase = new DeleteUserUseCase(
		userServiceMock as any,
		userPreferenceServiceMock as any,
		userStrategyMock as any,
		exceptionsMock as any,
	);

	describe('# Main Flux', () => {
		test('Should return deleted user', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ id: 'b5483856-1bf7-4dae-9c21-d7ea4dd30d1d', userId: userEntity.getId() });
			userServiceMock.getById.mockResolvedValueOnce(userEntity);
			userPreferenceServiceMock.getByUserId.mockResolvedValueOnce(userPreferenceEntity);
			userStrategyMock.isAllowedToManageUser.mockReturnValueOnce(true);
			userPreferenceServiceMock.delete.mockResolvedValueOnce(true);
			userServiceMock.delete.mockResolvedValueOnce(true);

			const result = await deleteUserUseCase.execute('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', userAgent);
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
			userStrategyMock.isAllowedToManageUser.mockReturnValueOnce(true);
			userPreferenceServiceMock.delete.mockResolvedValueOnce(false);
			userServiceMock.delete.mockResolvedValueOnce(false);

			const result = await deleteUserUseCase.execute('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', userAgent);
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
	});

	describe('# Exceptions', () => {
		test('Should throw a business error', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ id: 'b5483856-1bf7-4dae-9c21-d7ea4dd30d1d', userId: userEntity.getId() });
			const otherUserAgent = { username: 'test', clientId: '1' };
			userServiceMock.getById.mockResolvedValueOnce(userEntity);
			userPreferenceServiceMock.getByUserId.mockResolvedValueOnce(userPreferenceEntity);

			await expect(deleteUserUseCase.execute('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', otherUserAgent))
				.rejects.toMatchObject(new Error('userAgent not allowed to delete this user!'));
			expect(exceptionsMock.business).toHaveBeenCalledWith({
				message: 'userAgent not allowed to delete this user!'
			});
		});

		test('Should throw a not found error', async () => {
			userServiceMock.getById.mockRejectedValueOnce(exceptionsMock.notFound({
				message: 'User not founded by ID!',
			}));

			await expect(deleteUserUseCase.execute('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', userAgent))
				.rejects.toMatchObject(new Error('User not founded by ID!'));
			expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
			expect(userServiceMock.getById).toHaveBeenCalledWith('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', true);
			expect(userPreferenceServiceMock.getByUserId).not.toHaveBeenCalled();
			expect(exceptionsMock.notFound).toHaveBeenCalledWith({
				message: 'User not founded by ID!'
			});
		});

		test('Should throw a unauthorized error', async () => {
			await expect(deleteUserUseCase.execute('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d'))
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
