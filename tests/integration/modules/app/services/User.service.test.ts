import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import UsersModel from '@core/infra/database/models/Users.model';
import { configServiceMock } from '@dev/mocks/mockedModules';
import UserService from '@app/user/services/User.service';
import UserRepository from '@app/user/repositories/user/User.repository';
import Exceptions from '@core/errors/Exceptions';
import CryptographyService from '@core/security/Cryptography.service';
import UserEntity from '@domain/entities/User.entity';


describe('Modules :: App :: User :: Services :: UserService', () => {
	let nestTestingModule: TestingModule;
	let userService: UserService;
	// // mocks
	const userRepositoryMock = {
		getById: jest.fn(async (id: string, withoutPassword?: boolean): Promise<UserEntity | null> => (null)),
		create: jest.fn(async (entity: UserEntity): Promise<UserEntity> => { throw new Error('GenericError'); }),
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
			userRepositoryMock.create.mockResolvedValueOnce(new UserEntity({
				id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d',
				email: 'user.test@nomail.dev',
				password: 'pas123',
			}));

			const createdUser = await userService.create(new UserEntity({
				id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d',
				email: 'user.test@nomail.dev',
				password: 'pas123',
			}));
			expect(userRepositoryMock.create).toHaveBeenCalledTimes(1);
			expect(createdUser?.getId()).toBe('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d');
			expect(createdUser?.getEmail()).toBe('user.test@nomail.dev');
		});

		test('Should not create a user', async () => {
			await expect(userService.create(new UserEntity({
				id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d',
				email: 'user.test@nomail.dev',
				password: 'pas123',
			}))).rejects.toMatchObject({
				name: 'internal',
				message: 'Error to comunicate with database',
			});
			expect(userRepositoryMock.create).toHaveBeenCalledTimes(1);
		});
	});

	describe('# Get User', () => {
		test('Should find a user successfully', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			userRepositoryMock.getById.mockResolvedValueOnce(userEntity);

			const user = await userService.getById('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d');
			expect(userRepositoryMock.getById).toHaveBeenCalledTimes(1);
			expect(user?.getId()).toBe('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d');
		});

		test('Should not find a user', async () => {
			await expect(userService.getById('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d'))
				.rejects.toMatchObject({
					name: 'internal',
					message: 'Error to comunicate with database',
				});
			expect(userRepositoryMock.getById).toHaveBeenCalledTimes(1);
		});
	});

	describe('# Update User', () => {
		test('Should update a user successfully', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			userRepositoryMock.update.mockImplementationOnce(async (id: string, dataValues: Partial<UsersModel>) => {
				if (dataValues.email) userEntity.setEmail(dataValues.email);
				return userEntity;
			});

			const updatedUser = await userService.update('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', new UserEntity({
				email: 'user.test@nomail.dev',
			}).getAttributes());
			expect(userRepositoryMock.update).toHaveBeenCalledTimes(1);
			expect(updatedUser?.getEmail()).toBe('user.test@nomail.dev');
		});

		test('Should not update a user', async () => {
			await expect(userService.update('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', new UserEntity({
				email: 'user.test@nomail.dev',
			}).getAttributes()))
				.rejects.toMatchObject({
					name: 'internal',
					message: 'Error to comunicate with database',
				});
			expect(userRepositoryMock.update).toHaveBeenCalledTimes(1);
		});
	});

	describe('# Delete User', () => {
		test('Should delete a user successfully', async () => {
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			userRepositoryMock.deleteOne.mockResolvedValueOnce(true);

			const deletedUser = await userService.delete(userEntity.getId(), { softDelete: true });
			expect(userRepositoryMock.deleteOne).toHaveBeenCalledTimes(1);
			expect(deletedUser).toBe(true);
		});

		test('Should not delete a user', async () => {
			userRepositoryMock.deleteOne.mockResolvedValueOnce(false);

			const deletedUser = await userService.delete('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', { softDelete: true });
			expect(userRepositoryMock.deleteOne).toHaveBeenCalledTimes(1);
			expect(deletedUser).toBe(false);
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});
	afterAll(async () => {
		await nestTestingModule.close();
	});
});
