import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import configs from '../../../../../src/configs/configs.config';
import UserService from '../../../../../src/modules/app/services/User.service';
import UserRepository from '../../../../../src/modules/app/repositories/user/User.repository';
import Exceptions from '../../../../../src/infra/errors/Exceptions';
import UserEntity from '../../../../../src/modules/app/domain/entities/User.entity';


describe('Modules :: App :: Services :: UserService', () => {
	let nestTestingModule: TestingModule;
	let userService: UserService;
	// // mocks
	const userRepositoryMock = {
		getById: jest.fn(async (id: number, restrictData?: boolean): Promise<UserEntity | null> => (null)),
		create: jest.fn(async (data: any): Promise<UserEntity | null> => (null)),
		update: jest.fn(async (id: number, data: any): Promise<UserEntity | null> => (null)),
		deleteOne: jest.fn(async (id: number, softDelete?: boolean, agentId?: string | number | null): Promise<boolean> => (false)),
		list: jest.fn(async (query?: any, restrictData?: boolean): Promise<any> => ({ content: [], pageNumber: 0, pageSize: 0, totalPages: 0, totalItems: 0 })),
	};
	const configServiceMock: any = {
		get: (propertyPath?: string) => {
			if (propertyPath)
				return configs()[propertyPath];
			else
				return configs();
		},
	};

	// ? build test app
	beforeAll(async () => {
		nestTestingModule = await Test.createTestingModule({
			providers: [
				UserService,
				{ provide: UserRepository, useValue: userRepositoryMock },
				Exceptions,
				{ provide: ConfigService, useValue: configServiceMock },
			]
		}).compile();

		// * get app provider
		userService = nestTestingModule.get<UserService>(UserService);
	});

	describe('# Create User', () => {

		test('Should create a user successfully', async () => {
			userRepositoryMock.create.mockImplementation(async (data: any): Promise<UserEntity | null> => (new UserEntity(data)));

			const createdUser = await userService.create({
				id: 1,
				email: 'user.test@nomail.dev',
			});
			expect(userRepositoryMock.create).toHaveBeenCalledTimes(1);
			expect(createdUser?.getId()).toBe(1);
			expect(createdUser?.getLogin()?.email).toBe('user.test@nomail.dev');
		});

		test('Should not create a user', async () => {
			userRepositoryMock.create.mockImplementation(async (data: any): Promise<UserEntity | null> => (null));

			const createdUser = await userService.create({
				id: 1,
				email: 'user.test@nomail.dev',
			});
			expect(userRepositoryMock.create).toHaveBeenCalledTimes(1);
			expect(createdUser).toBeNull();
		});
	});

	describe('# Get User', () => {

		test('Should find a user successfully', async () => {
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test' });
			userRepositoryMock.getById.mockImplementation(async (id: number, restrictData?: boolean): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});

			const user = await userService.getById(1);
			expect(userRepositoryMock.getById).toHaveBeenCalledTimes(1);
			expect(user?.getId()).toBe(1);
		});

		test('Should not find a user', async () => {
			userRepositoryMock.getById.mockImplementation(async (id: number, restrictData?: boolean): Promise<UserEntity | null> => (null));

			const user = await userService.getById(1);
			expect(userRepositoryMock.getById).toHaveBeenCalledTimes(1);
			expect(user).toBeNull();
		});
	});

	describe('# Update User', () => {

		test('Should update a user successfully', async () => {
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test' });
			userRepositoryMock.update.mockImplementation(async (id: number, data: any): Promise<UserEntity | null> => {
				if (id !== userEntity.getId()) return null;
				if (data?.email) userEntity.setLogin(data.email, String(userEntity.getLogin().fullName));
				return userEntity;
			});

			const updatedUser = await userService.update(1, {
				email: 'user.test@nomail.dev',
			});
			expect(userRepositoryMock.update).toHaveBeenCalledTimes(1);
			expect(updatedUser?.getLogin()?.email).toBe('user.test@nomail.dev');
		});

		test('Should not update a user', async () => {
			userRepositoryMock.update.mockImplementation(async (id: number, data: any): Promise<UserEntity | null> => (null));

			const updatedUser = await userService.update(1, {
				email: 'user.test@nomail.dev',
			});
			expect(userRepositoryMock.update).toHaveBeenCalledTimes(1);
			expect(updatedUser).toBeNull();
		});
	});

	describe('# Delete User', () => {

		test('Should delete a user successfully', async () => {
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test' });
			userRepositoryMock.deleteOne.mockImplementation(async (id: number, softDelete?: boolean, agentId?: string | number | null): Promise<boolean> => {
				if (id === userEntity.getId())
					return true;
				return false;
			});

			const deletedUser = await userService.delete(userEntity.getId(), { softDelete: true });
			expect(userRepositoryMock.deleteOne).toHaveBeenCalledTimes(1);
			expect(deletedUser).toBe(true);
		});

		test('Should not delete a user', async () => {
			userRepositoryMock.deleteOne.mockImplementation(async (id: number, softDelete?: boolean, agentId?: string | number | null): Promise<boolean> => (false));

			const deletedUser = await userService.delete(1, { softDelete: true });
			expect(userRepositoryMock.deleteOne).toHaveBeenCalledTimes(1);
			expect(deletedUser).toBe(false);
		});
	});

	afterAll(async () => {
		await nestTestingModule.close();
	});
});
