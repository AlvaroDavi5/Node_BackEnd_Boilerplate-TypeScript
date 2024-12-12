import Exceptions from '@core/errors/Exceptions';
import CryptographyService from '@core/security/Cryptography.service';
import LoginUserUseCase from '@app/user/usecases/LoginUser.usecase';
import UserService from '@app/user/services/User.service';
import UserPreferenceService from '@app/user/services/UserPreference.service';
import UserEntity, { IUpdateUser } from '@domain/entities/User.entity';
import UserPreferenceEntity, { IUpdateUserPreference } from '@domain/entities/UserPreference.entity';
import { ListQueryInterface, PaginationInterface } from '@shared/internal/interfaces/listPaginationInterface';
import { ErrorInterface } from '@shared/internal/interfaces/errorInterface';


describe('Modules :: App :: User :: UseCases :: LoginUserUseCase', () => {
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
		update: jest.fn(async (_id: string, _data: IUpdateUser): Promise<UserEntity> => { throw new Error('GenericError'); }),
		delete: jest.fn(async (_id: string, _data: { softDelete: boolean, agentUserId?: string }): Promise<boolean> => (false)),
		list: jest.fn(async (_query: ListQueryInterface, _withoutSensibleData = true): Promise<PaginationInterface<UserEntity>> => {
			return { content: [], pageNumber: 0, pageSize: 0, totalPages: 0, totalItems: 0 };
		}),
		protectPassword: jest.fn((password: string): string => (password)),
		validatePassword: jest.fn((_entity: UserEntity, _passwordToValidate: string): void => { throw new Error('GenericError'); }),
	};
	const userPreferenceServiceMock = {
		getByUserId: jest.fn(async (_userId: string): Promise<UserPreferenceEntity> => { throw new Error('GenericError'); }),
		create: jest.fn(async (_entity: UserPreferenceEntity): Promise<UserPreferenceEntity> => { throw new Error('GenericError'); }),
		update: jest.fn(async (_id: string, _data: IUpdateUserPreference): Promise<UserPreferenceEntity> => { throw new Error('GenericError'); }),
		delete: jest.fn(async (_id: string, _data: { softDelete: boolean }): Promise<boolean> => (false)),
	};
	const cryptographyServiceMock = {
		encodeJwt: jest.fn((_payload: unknown, _inputEncoding: BufferEncoding, _expiration?: string): string => ('')),
	};

	const loginUserUseCase = new LoginUserUseCase(
		userServiceMock as unknown as UserService,
		userPreferenceServiceMock as unknown as UserPreferenceService,
		cryptographyServiceMock as unknown as CryptographyService,
		exceptionsMock as unknown as Exceptions,
	);

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('# Main Flux', () => {
		test('Should validate password', async () => {
			// eslint-disable-next-line max-len
			const mockedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXIuZGVmYXVsdEBub21haWwuZGV2IiwiY2xpZW50SWQiOiIxODZlN2RhYS1kMmRmLTQ0YWYtYmE4Yy00ZjIwNDM1NmQwZjkiLCJpYXQiOjE3MTgxNTY2MjQsImV4cCI6MTcxODI0MzAyNH0.4gmn_kp7YaZq4XGvKxe2i6QgWZh-f2iNaJg40md6agQ';
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test', password: 'admin' });
			userServiceMock.getById.mockResolvedValueOnce(userEntity);
			userServiceMock.getByEmail.mockResolvedValueOnce(userEntity);
			userServiceMock.validatePassword.mockImplementationOnce((_entity: UserEntity, _passwordToValidate: string) => { return undefined; });
			userPreferenceServiceMock.getByUserId.mockResolvedValueOnce(new UserPreferenceEntity({ userId: userEntity.getId() }));
			cryptographyServiceMock.encodeJwt.mockReturnValueOnce(mockedToken);

			const result = await loginUserUseCase.execute({ email: 'user.test@nomail.test', password: 'admin' });
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
			expect(result.token).toBe(mockedToken);
			expect(result.user.getEmail()).toBe('user.test@nomail.test');
			expect(result.user.getPassword()).toBe('');
		});

		test('Should not validate password', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test', password: 'admin' });
			userServiceMock.getById.mockResolvedValueOnce(userEntity);
			userServiceMock.getByEmail.mockResolvedValueOnce(userEntity);
			userServiceMock.validatePassword.mockImplementationOnce((_entity: UserEntity, _passwordToValidate: string) => {
				throw exceptionsMock.unauthorized({
					message: 'Password hash is different from database',
				});
			});

			await expect(loginUserUseCase.execute({ email: 'user.test@nomail.test', password: 'admin' }))
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
	});

	describe('# Exceptions', () => {
		test('Should throw a not found error', async () => {
			userServiceMock.getByEmail.mockResolvedValueOnce(null);

			await expect(loginUserUseCase.execute({ email: 'user.test@nomail.test', password: 'admin' }))
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
});
