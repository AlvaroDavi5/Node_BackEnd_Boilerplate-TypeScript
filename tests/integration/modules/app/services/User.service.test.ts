import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import configs from '../../../../../src/modules/core/configs/configs.config';
import UserService from '../../../../../src/modules/app/user/services/User.service';
import UserRepository from '../../../../../src/modules/app/user/repositories/user/User.repository';
import Exceptions from '../../../../../src/modules/core/infra/errors/Exceptions';
import CryptographyService from '../../../../../src/modules/core/infra/security/Cryptography.service';
import UserEntity from '../../../../../src/modules/domain/entities/User.entity';


describe('Modules :: App :: Services :: UserService', () => {
	let nestTestingModule: TestingModule;
	let userService: UserService;
	// // mocks
	const userRepositoryMock = {
		getById: jest.fn(async (id: number, restrictData = true): Promise<UserEntity | null> => (null)),
		create: jest.fn(async (entity: UserEntity): Promise<UserEntity | null> => (null)),
		update: jest.fn(async (id: number, entity: UserEntity): Promise<UserEntity | null> => (null)),
		deleteOne: jest.fn(async (id: number, softDelete = true, agentId: number | string | null = null): Promise<boolean> => (false)),
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
				{ provide: ConfigService, useValue: configServiceMock },
				Exceptions,
				{ provide: UserRepository, useValue: userRepositoryMock },
				CryptographyService,
				UserService,
			]
		}).compile();

		// * get app provider
		userService = nestTestingModule.get<UserService>(UserService);
	});

	describe('# Create User', () => {
		test('Should create a user successfully', async () => {
			userRepositoryMock.create.mockImplementation(async (entity: UserEntity): Promise<UserEntity | null> => (new UserEntity(entity.getAttributes())));

			const createdUser = await userService.create(new UserEntity({
				id: 1,
				email: 'user.test@nomail.dev',
				password: 'pas123',
			}));
			expect(userRepositoryMock.create).toHaveBeenCalledTimes(1);
			expect(createdUser?.getId()).toBe(1);
			expect(createdUser?.getLogin()?.email).toBe('user.test@nomail.dev');
		});

		test('Should not create a user', async () => {
			userRepositoryMock.create.mockImplementation(async (entity: UserEntity): Promise<UserEntity | null> => (null));

			const createdUser = await userService.create(new UserEntity({
				id: 1,
				email: 'user.test@nomail.dev',
				password: 'pas123',
			}));
			expect(userRepositoryMock.create).toHaveBeenCalledTimes(1);
			expect(createdUser).toBeNull();
		});
	});

	describe('# Get User', () => {
		test('Should find a user successfully', async () => {
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test' });
			userRepositoryMock.getById.mockImplementation(async (id: number, restrictData = true): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});

			const user = await userService.getById(1);
			expect(userRepositoryMock.getById).toHaveBeenCalledTimes(1);
			expect(user?.getId()).toBe(1);
		});

		test('Should not find a user', async () => {
			userRepositoryMock.getById.mockImplementation(async (id: number, restrictData = true): Promise<UserEntity | null> => (null));

			const user = await userService.getById(1);
			expect(userRepositoryMock.getById).toHaveBeenCalledTimes(1);
			expect(user).toBeNull();
		});
	});

	describe('# Update User', () => {
		test('Should update a user successfully', async () => {
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test' });
			userRepositoryMock.update.mockImplementation(async (id: number, entity: UserEntity): Promise<UserEntity | null> => {
				if (id !== userEntity.getId()) return null;
				const userEmail = entity.getLogin().email;
				if (userEmail) userEntity.setLogin(userEmail, String(userEntity.getLogin().fullName));
				return userEntity;
			});

			const updatedUser = await userService.update(1, new UserEntity({
				email: 'user.test@nomail.dev',
			}));
			expect(userRepositoryMock.update).toHaveBeenCalledTimes(1);
			expect(updatedUser?.getLogin()?.email).toBe('user.test@nomail.dev');
		});

		test('Should not update a user', async () => {
			userRepositoryMock.update.mockImplementation(async (id: number, entity: UserEntity): Promise<UserEntity | null> => (null));

			const updatedUser = await userService.update(1, new UserEntity({
				email: 'user.test@nomail.dev',
			}));
			expect(userRepositoryMock.update).toHaveBeenCalledTimes(1);
			expect(updatedUser).toBeNull();
		});
	});

	describe('# Delete User', () => {
		test('Should delete a user successfully', async () => {
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test' });
			userRepositoryMock.deleteOne.mockImplementation(async (id: number, softDelete = true, agentId: number | string | null = null): Promise<boolean> => {
				if (id === userEntity.getId())
					return true;
				return false;
			});

			const deletedUser = await userService.delete(userEntity.getId(), { softDelete: true });
			expect(userRepositoryMock.deleteOne).toHaveBeenCalledTimes(1);
			expect(deletedUser).toBe(true);
		});

		test('Should not delete a user', async () => {
			userRepositoryMock.deleteOne.mockImplementation(async (id: number, softDelete = true, agentId: number | string | null = null): Promise<boolean> => (false));

			const deletedUser = await userService.delete(1, { softDelete: true });
			expect(userRepositoryMock.deleteOne).toHaveBeenCalledTimes(1);
			expect(deletedUser).toBe(false);
		});
	});

	afterAll(async () => {
		await nestTestingModule.close();
	});
});
