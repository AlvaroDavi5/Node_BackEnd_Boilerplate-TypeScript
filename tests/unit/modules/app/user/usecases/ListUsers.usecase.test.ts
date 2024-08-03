import ListUsersUseCase from '@app/user/usecases/ListUsers.usecase';
import UserService from '@app/user/services/User.service';
import UserEntity, { IUpdateUser } from '@domain/entities/User.entity';
import { ListQueryInterface, PaginationInterface } from '@shared/internal/interfaces/listPaginationInterface';


describe('Modules :: App :: User :: UseCases :: ListUsersUseCase', () => {
	// // mocks
	const userServiceMock = {
		getByEmail: jest.fn(async (_email: string): Promise<UserEntity | null> => (null)),
		getById: jest.fn(async (_id: string, _withoutPassword = true): Promise<UserEntity> => { throw new Error('GenericError'); }),
		create: jest.fn(async (_entity: UserEntity): Promise<UserEntity> => { throw new Error('GenericError'); }),
		update: jest.fn(async (_id: string, _data: IUpdateUser): Promise<UserEntity> => { throw new Error('GenericError'); }),
		delete: jest.fn(async (_id: string, _data: { softDelete: boolean, userAgentId?: string }): Promise<boolean> => (false)),
		list: jest.fn(async (_query: ListQueryInterface, _withoutSensibleData = true): Promise<PaginationInterface<UserEntity>> => {
			return { content: [], pageNumber: 0, pageSize: 0, totalPages: 0, totalItems: 0 };
		}),
		protectPassword: jest.fn((password: string): string => (password)),
		validatePassword: jest.fn((_entity: UserEntity, _passwordToValidate: string): void => { throw new Error('GenericError'); }),
	};

	const listUsersUseCase = new ListUsersUseCase(userServiceMock as unknown as UserService);

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('# Main Flux', () => {
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

			const result = await listUsersUseCase.execute(listData);
			expect(userServiceMock.list).toHaveBeenCalledTimes(1);
			expect(userServiceMock.list).toHaveBeenCalledWith(listData);
			expect(result.totalItems).toBe(listResult.totalItems);
			expect(result.content).toEqual(listResult.content);
		});
	});

	describe('# Exceptions', () => {
		test('Should throw a not found error', async () => {
			userServiceMock.list.mockRejectedValueOnce(new Error('Error to comunicate with database'));

			await expect(listUsersUseCase.execute({}))
				.rejects.toMatchObject(new Error('Error to comunicate with database'));
			expect(userServiceMock.list).toHaveBeenCalledTimes(1);
			expect(userServiceMock.list).toHaveBeenCalledWith({});
		});
	});
});
