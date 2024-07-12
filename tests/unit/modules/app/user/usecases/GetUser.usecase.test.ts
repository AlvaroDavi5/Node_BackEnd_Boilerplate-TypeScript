import GetUserUseCase from '@app/user/usecases/GetUser.usecase';
import UserEntity, { UpdateUserInterface } from '@domain/entities/User.entity';
import UserPreferenceEntity, { UpdateUserPreferenceInterface } from '@domain/entities/UserPreference.entity';
import { ListQueryInterface, PaginationInterface } from '@shared/internal/interfaces/listPaginationInterface';
import { ErrorInterface } from '@shared/internal/interfaces/errorInterface';


describe('Modules :: App :: User :: UseCases :: GetUserUseCase', () => {
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
	const getUserUseCase = new GetUserUseCase(
		userServiceMock as any,
		userPreferenceServiceMock as any,
		exceptionsMock as any,
	);

	describe('# Main Flux', () => {
		test('Should return finded user', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ userId: userEntity.getId() });
			userServiceMock.getById.mockResolvedValueOnce(userEntity);
			userPreferenceServiceMock.getByUserId.mockResolvedValueOnce(userPreferenceEntity);

			const result = await getUserUseCase.execute('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', userAgent);
			expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
			expect(userServiceMock.getById).toHaveBeenCalledWith('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', true);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalledWith('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d');
			expect(result?.getId()).toBe(userEntity.getId());
			expect(result?.getEmail()).toBe(userEntity.getEmail());
		});
	});

	describe('# Exceptions', () => {
		test('Should throw a not found error', async () => {
			userServiceMock.getById.mockRejectedValueOnce(exceptionsMock.notFound({
				message: 'User not founded by ID!',
			}));

			await expect(getUserUseCase.execute('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', userAgent))
				.rejects.toMatchObject(new Error('User not founded by ID!'));
			expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalled();
			expect(exceptionsMock.notFound).toHaveBeenCalledWith({
				message: 'User not founded by ID!'
			});
		});

		test('Should throw a unauthorized error', async () => {
			await expect(getUserUseCase.execute(''))
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
