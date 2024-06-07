import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import UsersModel from '../../../../../src/modules/core/infra/database/models/Users.model';
import { configServiceMock } from '../../../../../src/dev/mocks/mockedModules';
import UserService from '../../../../../src/modules/app/user/services/User.service';
import UserRepository from '../../../../../src/modules/app/user/repositories/user/User.repository';
import Exceptions from '../../../../../src/modules/core/errors/Exceptions';
import CryptographyService from '../../../../../src/modules/core/security/Cryptography.service';
import UserEntity from '../../../../../src/modules/domain/entities/User.entity';


describe('Modules :: App :: User :: Services :: UserService', () => {
	let nestTestingModule: TestingModule;
	let userService: UserService;
	// // mocks
	const userRepositoryMock = {
		getById: jest.fn(async (id: string, withoutPassword?: boolean): Promise<UserEntity | null> => (null)),
		create: jest.fn(async (entity: UserEntity): Promise<UserEntity> => (new UserEntity({}))),
		update: jest.fn(async (id: string, dataValues: Partial<UsersModel>): Promise<UserEntity | null> => (null)),
		deleteOne: jest.fn(async (id: string, softDelete?: boolean, agentId?: string | null): Promise<boolean> => (false)),
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
			userRepositoryMock.create.mockImplementation(async (entity: UserEntity): Promise<UserEntity> => (new UserEntity(entity.getAttributes())));

			const createdUser = await userService.create(new UserEntity({
				id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d',
				email: 'user.test@nomail.dev',
				password: 'pas123',
			}));
			expect(userRepositoryMock.create).toHaveBeenCalledTimes(1);
			expect(createdUser?.getId()).toBe('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d');
			expect(createdUser?.getLogin()?.email).toBe('user.test@nomail.dev');
		});

		test('Should not create a user', async () => {
			userRepositoryMock.create.mockImplementation(async (entity: UserEntity): Promise<UserEntity> => { throw new Error('Unable to create User'); });

			try {
				await userService.create(new UserEntity({
					id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d',
					email: 'user.test@nomail.dev',
					password: 'pas123',
				}));
			} catch (error) {
				expect(userRepositoryMock.create).toHaveBeenCalledTimes(1);
				expect(error.message).toBe('Error to comunicate with database');
			}
		});
	});

	describe('# Get User', () => {
		test('Should find a user successfully', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			userRepositoryMock.getById.mockImplementation(async (id: string, withoutPassword?: boolean): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});

			const user = await userService.getById('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d');
			expect(userRepositoryMock.getById).toHaveBeenCalledTimes(1);
			expect(user?.getId()).toBe('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d');
		});

		test('Should not find a user', async () => {
			userRepositoryMock.getById.mockImplementation(async (id: string, withoutPassword?: boolean): Promise<UserEntity | null> => (null));

			const user = await userService.getById('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d');
			expect(userRepositoryMock.getById).toHaveBeenCalledTimes(1);
			expect(user).toBeNull();
		});
	});

	describe('# Update User', () => {
		test('Should update a user successfully', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			userRepositoryMock.update.mockImplementation(async (id: string, dataValues: Partial<UsersModel>): Promise<UserEntity | null> => {
				if (id !== userEntity.getId()) return null;
				const userEmail = dataValues.email;
				if (userEmail) userEntity.setLogin(userEmail, userEntity.getLogin().fullName as string);
				return userEntity;
			});

			const updatedUser = await userService.update('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', new UserEntity({
				email: 'user.test@nomail.dev',
			}));
			expect(userRepositoryMock.update).toHaveBeenCalledTimes(1);
			expect(updatedUser?.getLogin()?.email).toBe('user.test@nomail.dev');
		});

		test('Should not update a user', async () => {
			userRepositoryMock.update.mockImplementation(async (id: string, dataValues: Partial<UsersModel>): Promise<UserEntity | null> => (null));

			const updatedUser = await userService.update('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', new UserEntity({
				email: 'user.test@nomail.dev',
			}));
			expect(userRepositoryMock.update).toHaveBeenCalledTimes(1);
			expect(updatedUser).toBeNull();
		});
	});

	describe('# Delete User', () => {
		test('Should delete a user successfully', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			userRepositoryMock.deleteOne.mockImplementation(async (id: string, softDelete?: boolean, agentId?: string | null): Promise<boolean> => {
				if (id === userEntity.getId())
					return true;
				return false;
			});

			const deletedUser = await userService.delete(userEntity.getId(), { softDelete: true });
			expect(userRepositoryMock.deleteOne).toHaveBeenCalledTimes(1);
			expect(deletedUser).toBe(true);
		});

		test('Should not delete a user', async () => {
			userRepositoryMock.deleteOne.mockImplementation(async (id: string, softDelete?: boolean, agentId?: string | null): Promise<boolean> => (false));

			const deletedUser = await userService.delete('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', { softDelete: true });
			expect(userRepositoryMock.deleteOne).toHaveBeenCalledTimes(1);
			expect(deletedUser).toBe(false);
		});
	});

	afterAll(async () => {
		await nestTestingModule.close();
	});
});
