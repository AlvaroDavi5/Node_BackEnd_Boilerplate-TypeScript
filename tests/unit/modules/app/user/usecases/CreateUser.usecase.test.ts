import Exceptions from '@core/errors/Exceptions';
import UserEntity, { IUpdateUser } from '@domain/entities/User.entity';
import UserPreferenceEntity, { IUpdateUserPreference } from '@domain/entities/UserPreference.entity';
import CreateUserUseCase from '@app/user/usecases/CreateUser.usecase';
import UserService from '@app/user/services/User.service';
import UserPreferenceService from '@app/user/services/UserPreference.service';
import CreateUserInputDto from '@app/user/api/dto/user/CreateUserInput.dto';
import HttpMessagesConstants from '@common/constants/HttpMessages.constants';
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
	const httpMessagesConstantsMock = {
		messages: { conflict: jest.fn((element: string): string => (`${element} already exists!`)) },
	};
	const userServiceMock = {
		getByEmail: jest.fn(async (_email: string): Promise<UserEntity | null> => (null)),
		getById: jest.fn(async (_id: string, _withoutPassword = true): Promise<UserEntity> => {
			throw new Error('GenericError');
		}),
		create: jest.fn(async (_entity: UserEntity): Promise<UserEntity> => {
			throw new Error('GenericError');
		}),
		update: jest.fn(async (_id: string, _data: IUpdateUser): Promise<UserEntity> => {
			throw new Error('GenericError');
		}),
		delete: jest.fn(async (_id: string, _data: { softDelete: boolean, agentUserId?: string }): Promise<boolean> => (false)),
		list: jest.fn(async (_query: ListQueryInterface, _withoutSensibleData = true): Promise<PaginationInterface<UserEntity>> => {
			return { content: [], pageNumber: 0, pageSize: 0, totalPages: 0, totalItems: 0 };
		}),
		protectPassword: jest.fn((password: string): string => (password)),
		validatePassword: jest.fn((_entity: UserEntity, _passwordToValidate: string): void => {
			throw new Error('GenericError');
		}),
	};
	const userPreferenceServiceMock = {
		getByUserId: jest.fn(async (_userId: string): Promise<UserPreferenceEntity> => {
			throw new Error('GenericError');
		}),
		create: jest.fn(async (_entity: UserPreferenceEntity): Promise<UserPreferenceEntity> => {
			throw new Error('GenericError');
		}),
		update: jest.fn(async (_id: string, _data: IUpdateUserPreference): Promise<UserPreferenceEntity> => {
			throw new Error('GenericError');
		}),
		delete: jest.fn(async (_id: string, _data: { softDelete: boolean }): Promise<boolean> => (false)),
	};

	const agentUser = { username: 'user.test@nomail.test', clientId: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d' };
	const createUserUseCase = new CreateUserUseCase(
		userServiceMock as unknown as UserService,
		userPreferenceServiceMock as unknown as UserPreferenceService,
		httpMessagesConstantsMock as unknown as HttpMessagesConstants,
		exceptionsMock as unknown as Exceptions,
	);

	afterEach(() => {
		jest.clearAllMocks();
	});

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

			const result = await createUserUseCase.execute(userEntity.getAttributes(), agentUser);
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

			await expect(createUserUseCase.execute(userEntity.getAttributes(), agentUser))
				.rejects.toMatchObject(new Error('User not founded by ID!'));
			expect(userServiceMock.create).toHaveBeenCalledTimes(1);
			expect(userPreferenceServiceMock.create).toHaveBeenCalledTimes(1);
			expect(userServiceMock.getById).toHaveBeenCalledTimes(1);
			expect(userServiceMock.getById).toHaveBeenCalledWith('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', true);
			expect(userPreferenceServiceMock.getByUserId).toHaveBeenCalled();
			expect(httpMessagesConstantsMock.messages.conflict).not.toHaveBeenCalled();
			expect(exceptionsMock.notFound).toHaveBeenCalledWith({
				message: 'User not founded by ID!'
			});
		});

		test('Should throw a conflict error', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			userServiceMock.getByEmail.mockResolvedValueOnce(userEntity);

			await expect(createUserUseCase.execute(userEntity.getAttributes(), agentUser))
				.rejects.toMatchObject(new Error('User already exists!'));
			expect(userServiceMock.create).not.toHaveBeenCalled();
			expect(userPreferenceServiceMock.create).not.toHaveBeenCalled();
			expect(userServiceMock.getById).not.toHaveBeenCalled();
			expect(userPreferenceServiceMock.getByUserId).not.toHaveBeenCalled();
			expect(httpMessagesConstantsMock.messages.conflict).toHaveBeenCalledWith('User');
			expect(exceptionsMock.conflict).toHaveBeenCalledWith({
				message: 'User already exists!'
			});
		});

		test('Should throw a unauthorized error', async () => {
			await expect(createUserUseCase.execute({} as unknown as CreateUserInputDto))
				.rejects.toMatchObject(new Error('Invalid agentUser'));
			expect(exceptionsMock.unauthorized).toHaveBeenCalledWith({
				message: 'Invalid agentUser'
			});
		});
	});
});
