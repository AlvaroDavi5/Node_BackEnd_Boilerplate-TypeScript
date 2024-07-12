import CreateUserUseCase from '@app/user/usecases/CreateUser.usecase';
import UserEntity, { UpdateUserInterface } from '@domain/entities/User.entity';
import UserPreferenceEntity, { UpdateUserPreferenceInterface } from '@domain/entities/UserPreference.entity';
import { ListQueryInterface, PaginationInterface } from '@shared/internal/interfaces/listPaginationInterface';
import { ErrorInterface } from '@shared/internal/interfaces/errorInterface';


describe('Modules :: App :: User :: UseCases :: CreateUserUseCase', () => {
	// // mocks
	const exceptionsMock = {
		internal: jest.fn(({ message }: ErrorInterface): Error => (new Error(message))),
		integration: jest.fn(({ message }: ErrorInterface): Error => (new Error(message))),
		unauthorized: jest.fn(({ message }: ErrorInterface): Error => (new Error(message))),
		business: jest.fn(({ message }: ErrorInterface): Error => (new Error(message))),
		notFound: jest.fn(({ message }: ErrorInterface): Error => (new Error(message))),
		conflict: jest.fn(({ message }: ErrorInterface): Error => (new Error(message))),
	};
	const httpConstantsMock = {
		messages: { conflict: jest.fn((element: string): string => (`${element} already exists!`)) },
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
	const createUserUseCase = new CreateUserUseCase(
		userServiceMock as any,
		userPreferenceServiceMock as any,
		httpConstantsMock as any,
		exceptionsMock as any,
	);

	describe('# Main Flux', () => {
		test('Should return created user', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			const userPreferenceEntity = new UserPreferenceEntity({ userId: userEntity.getId() });
			userEntity.setPreference(userPreferenceEntity);
			userServiceMock.getByEmail.mockResolvedValueOnce(null);
			userServiceMock.create.mockResolvedValueOnce(userEntity);
			userPreferenceServiceMock.create.mockResolvedValueOnce(userPreferenceEntity);
			userServiceMock.getById.mockResolvedValueOnce(userEntity);
			userPreferenceServiceMock.getByUserId.mockResolvedValueOnce(userPreferenceEntity);

			const result = await createUserUseCase.execute(userEntity.getAttributes(), userAgent);
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
	});

	describe('# Exceptions', () => {
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

			await expect(createUserUseCase.execute(userEntity.getAttributes(), userAgent))
				.rejects.toMatchObject(new Error('User not founded by ID!'));
			expect(userServiceMock.create).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.create).toHaveBeenCalledTimes(1);
			expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
			expect(userServiceMock.getById).toHaveBeenCalledWith('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', true);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalled();
			expect(httpConstantsMock.messages.conflict).not.toHaveBeenCalled();
			expect(exceptionsMock.notFound).toHaveBeenCalledWith({
				message: 'User not founded by ID!'
			});
		});

		test('Should throw a conflict error', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			userServiceMock.getByEmail.mockResolvedValueOnce(userEntity);

			await expect(createUserUseCase.execute(userEntity.getAttributes(), userAgent))
				.rejects.toMatchObject(new Error('User already exists!'));
			expect(userServiceMock.create).not.toHaveBeenCalled();
			expect(userPreferenceServiceMock.create).not.toHaveBeenCalled();
			expect(userServiceMock.getById).not.toHaveBeenCalled();
			expect(userPreferenceServiceMock.getByUserId).not.toHaveBeenCalled();
			expect(httpConstantsMock.messages.conflict).toHaveBeenCalledWith('User');
			expect(exceptionsMock.conflict).toHaveBeenCalledWith({
				message: 'User already exists!'
			});
		});

		test('Should throw a unauthorized error', async () => {
			await expect(createUserUseCase.execute({} as any))
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
