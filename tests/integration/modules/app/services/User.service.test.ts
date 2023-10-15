import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import configs from '../../../../../src/configs/configs.config';
import UserService from '../../../../../src/modules/app/services/User.service';
import UserPreferenceService from '../../../../../src/modules/app/services/UserPreference.service';
import UserRepository from '../../../../../src/modules/app/repositories/user/User.repository';
import UserPreferenceRepository from '../../../../../src/modules/app/repositories/userPreference/UserPreference.repository';
import Exceptions from '../../../../../src/infra/errors/Exceptions';
import UserEntity from '../../../../../src/modules/app/domain/entities/User.entity';
import UserPreferenceEntity from '../../../../../src/modules/app/domain/entities/UserPreference.entity';


describe('Modules :: App :: Services :: UserServices', () => {
	let nestTestingModule: TestingModule;
	let userService: UserService;
	let userPreferenceService: UserPreferenceService;
	// // mocks
	const userRepositoryMock = {
		getById: jest.fn(async (id: number, restrictData?: boolean): Promise<UserEntity | null> => (null)),
		create: jest.fn(async (data: any): Promise<UserEntity | null> => (null)),
		update: jest.fn(async (id: number, data: any): Promise<UserEntity | null> => (null)),
		deleteOne: jest.fn(async (id: number, softDelete?: boolean, agentId?: string | number | null): Promise<boolean> => (false)),
		list: jest.fn(async (query?: any, restrictData?: boolean): Promise<any> => ({ content: [], pageNumber: 0, pageSize: 0, totalPages: 0, totalItems: 0 })),
	};
	const userPreferenceRepositoryMock = {
		findOne: jest.fn(async (query: any): Promise<UserPreferenceEntity | null> => (null)),
		create: jest.fn(async (data: any): Promise<UserPreferenceEntity | null> => (null)),
		update: jest.fn(async (id: number, data: any): Promise<UserPreferenceEntity | null> => (null)),
		deleteOne: jest.fn(async (id: number, softDelete?: boolean, agentId?: string | number | null): Promise<boolean> => (false)),
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
				UserPreferenceService,
				{ provide: UserRepository, useValue: userRepositoryMock },
				{ provide: UserPreferenceRepository, useValue: userPreferenceRepositoryMock },
				Exceptions,
				{ provide: ConfigService, useValue: configServiceMock },
			]
		}).compile();

		// * get app provider
		userService = nestTestingModule.get<UserService>(UserService);
		userPreferenceService = nestTestingModule.get<UserPreferenceService>(UserPreferenceService);
	});

	describe('# Create User', () => {

		test('Should get created user and preference successfully', async () => {
			userRepositoryMock.create.mockImplementation(async (data: any): Promise<UserEntity | null> => (new UserEntity(data)));
			userPreferenceRepositoryMock.create.mockImplementation(async (data: any): Promise<UserPreferenceEntity | null> => (new UserPreferenceEntity(data)));

			const createdUser = await userService.create({
				id: 1,
				email: 'user.test@nomail.dev',
			});
			expect(userRepositoryMock.create).toHaveBeenCalledTimes(1);
			expect(createdUser?.getId()).toBe(1);
			expect(createdUser?.getLogin()?.email).toBe('user.test@nomail.dev');

			const createdUserPreference = await userPreferenceService.create({
				userId: createdUser?.getId(),
				defaultTheme: 'DARK',
			});
			expect(userPreferenceRepositoryMock.create).toHaveBeenCalledTimes(1);
			expect(createdUserPreference?.getUserId()).toBe(1);
			expect(createdUserPreference?.getDefaultTheme()).toBe('DARK');
		});

		test('Should create user successfully and get a null preference', async () => {
			userRepositoryMock.create.mockImplementation(async (data: any): Promise<UserEntity | null> => (new UserEntity(data)));
			userPreferenceRepositoryMock.create.mockImplementation(async (data: any): Promise<UserPreferenceEntity | null> => (null));

			const createdUser = await userService.create({
				id: 1,
				email: 'user.test@nomail.dev',
			});
			expect(userRepositoryMock.create).toHaveBeenCalledTimes(1);
			expect(createdUser?.getId()).toBe(1);
			expect(createdUser?.getLogin()?.email).toBe('user.test@nomail.dev');

			const createdUserPreference = await userPreferenceService.create({
				userId: createdUser?.getId(),
				defaultTheme: 'DARK',
			});
			expect(userPreferenceRepositoryMock.create).toHaveBeenCalledTimes(1);
			expect(createdUserPreference).toBeNull();
		});

		test('Should get a null user and preference', async () => {
			userRepositoryMock.create.mockImplementation(async (data: any): Promise<UserEntity | null> => (null));
			userPreferenceRepositoryMock.create.mockImplementation(async (data: any): Promise<UserPreferenceEntity | null> => (null));

			const createdUser = await userService.create({
				id: 1,
				email: 'user.test@nomail.dev',
			});
			expect(userRepositoryMock.create).toHaveBeenCalledTimes(1);
			expect(createdUser).toBeNull();

			const createdUserPreference = await userPreferenceService.create({
				userId: createdUser?.getId(),
				defaultTheme: 'DARK',
			});
			expect(userPreferenceRepositoryMock.create).toHaveBeenCalledTimes(1);
			expect(createdUserPreference).toBeNull();
		});
	});

	describe('# Get User', () => {

		test('Should get finded user and preference successfully', async () => {
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test' });
			userRepositoryMock.getById.mockImplementation(async (id: number, restrictData?: boolean): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});
			const userPreferenceEntity = new UserPreferenceEntity({ id: 1, userId: userEntity.getId() });
			userPreferenceRepositoryMock.findOne.mockImplementation(async (query: any): Promise<UserPreferenceEntity | null> => {
				if (query?.userId === userPreferenceEntity.getUserId()) return userPreferenceEntity;
				else return null;
			});

			const user = await userService.getById(1);
			expect(userRepositoryMock.getById).toHaveBeenCalledTimes(1);
			expect(user?.getId()).toBe(1);

			const userPreference = await userPreferenceService.getByUserId(user?.getId());
			expect(userPreferenceRepositoryMock.findOne).toHaveBeenCalledTimes(1);
			expect(userPreference?.getUserId()).toBe(1);
		});

		test('Should get a user successfully get a null preference', async () => {
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test' });
			userRepositoryMock.getById.mockImplementation(async (id: number, restrictData?: boolean): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});
			userPreferenceRepositoryMock.findOne.mockImplementation(async (query: any): Promise<UserPreferenceEntity | null> => (null));

			const user = await userService.getById(1);
			expect(userRepositoryMock.getById).toHaveBeenCalledTimes(1);
			expect(user?.getId()).toBe(1);

			const userPreference = await userPreferenceService.getByUserId(user?.getId());
			expect(userPreferenceRepositoryMock.findOne).toHaveBeenCalledTimes(1);
			expect(userPreference).toBeNull();
		});

		test('Should get a null user and preference', async () => {
			userRepositoryMock.getById.mockImplementation(async (id: number, restrictData?: boolean): Promise<UserEntity | null> => (null));
			userPreferenceRepositoryMock.findOne.mockImplementation(async (query: any): Promise<UserPreferenceEntity | null> => (null));

			const user = await userService.getById(1);
			expect(userRepositoryMock.getById).toHaveBeenCalledTimes(1);
			expect(user).toBeNull();

			const userPreference = await userPreferenceService.getByUserId(1);
			expect(userPreferenceRepositoryMock.findOne).toHaveBeenCalledTimes(1);
			expect(userPreference).toBeNull();
		});
	});

	describe('# Update User', () => {

		test('Should get updated user and preference successfully', async () => {
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test' });
			userRepositoryMock.update.mockImplementation(async (id: number, data: any): Promise<UserEntity | null> => {
				if (id !== userEntity.getId()) return null;
				if (data?.email) userEntity.setLogin(data.email, String(userEntity.getLogin().fullName));
				return userEntity;
			});
			const userPreferenceEntity = new UserPreferenceEntity({ id: 1, userId: userEntity.getId(), defaultTheme: 'DEFAULT' });
			userPreferenceRepositoryMock.update.mockImplementation(async (id: number, data: any): Promise<UserPreferenceEntity | null> => {
				if (id !== userPreferenceEntity.getId()) return null;
				if (data?.defaultTheme) userPreferenceEntity.setDefaultTheme(data.defaultTheme);
				return userPreferenceEntity;
			});

			const updatedUser = await userService.update(1, {
				email: 'user.test@nomail.dev',
			});
			expect(userRepositoryMock.update).toHaveBeenCalledTimes(1);
			expect(updatedUser?.getLogin()?.email).toBe('user.test@nomail.dev');

			const updatedUserPreference = await userPreferenceService.update(1, {
				defaultTheme: 'DARK',
			});
			expect(userPreferenceRepositoryMock.update).toHaveBeenCalledTimes(1);
			expect(updatedUserPreference?.getDefaultTheme()).toBe('DARK');
		});

		test('Should update user successfully and get a null preference', async () => {
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test' });
			userRepositoryMock.update.mockImplementation(async (id: number, data: any): Promise<UserEntity | null> => {
				if (id !== userEntity.getId()) return null;
				if (data?.email) userEntity.setLogin(data.email, String(userEntity.getLogin().fullName));
				return userEntity;
			});
			userPreferenceRepositoryMock.update.mockImplementation(async (id: number, data: any): Promise<UserPreferenceEntity | null> => (null));

			const updatedUser = await userService.update(1, {
				email: 'user.test@nomail.dev',
			});
			expect(userRepositoryMock.update).toHaveBeenCalledTimes(1);
			expect(updatedUser?.getLogin()?.email).toBe('user.test@nomail.dev');

			const updatedUserPreference = await userPreferenceService.update(1, {
				defaultTheme: 'DARK',
			});
			expect(userPreferenceRepositoryMock.update).toHaveBeenCalledTimes(1);
			expect(updatedUserPreference).toBeNull();
		});

		test('Should get a null user and preference', async () => {
			userRepositoryMock.update.mockImplementation(async (id: number, data: any): Promise<UserEntity | null> => (null));
			userPreferenceRepositoryMock.update.mockImplementation(async (id: number, data: any): Promise<UserPreferenceEntity | null> => (null));

			const updatedUser = await userService.update(1, {
				email: 'user.test@nomail.dev',
			});
			expect(userRepositoryMock.update).toHaveBeenCalledTimes(1);
			expect(updatedUser).toBeNull();

			const updatedUserPreference = await userPreferenceService.update(1, {
				defaultTheme: 'DARK',
			});
			expect(userPreferenceRepositoryMock.update).toHaveBeenCalledTimes(1);
			expect(updatedUserPreference).toBeNull();
		});
	});

	describe('# Delete User', () => {

		test('Should get deleted user and preference successfully', async () => {
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test' });
			userRepositoryMock.deleteOne.mockImplementation(async (id: number, softDelete?: boolean, agentId?: string | number | null): Promise<boolean> => {
				if (id === userEntity.getId())
					return true;
				return false;
			});
			const userPreferenceEntity = new UserPreferenceEntity({ id: 1, userId: userEntity.getId() });
			userPreferenceRepositoryMock.deleteOne.mockImplementation(async (id: number, softDelete?: boolean, agentId?: string | number | null): Promise<boolean> => {
				if (id === userPreferenceEntity.getId())
					return true;
				return false;
			});

			const deletedUser = await userService.delete(userEntity.getId(), { softDelete: true });
			expect(userRepositoryMock.deleteOne).toHaveBeenCalledTimes(1);
			expect(deletedUser).toBe(true);

			const deletedUserPreference = await userPreferenceService.delete(userPreferenceEntity?.getId(), { softDelete: false });
			expect(userPreferenceRepositoryMock.deleteOne).toHaveBeenCalledTimes(1);
			expect(deletedUserPreference).toBe(true);
		});

		test('Should delete user successfully and get a null preference', async () => {
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test' });
			userRepositoryMock.deleteOne.mockImplementation(async (id: number, softDelete?: boolean, agentId?: string | number | null): Promise<boolean> => {
				if (id === userEntity.getId())
					return true;
				return false;
			});
			userPreferenceRepositoryMock.deleteOne.mockImplementation(async (id: number, softDelete?: boolean, agentId?: string | number | null): Promise<boolean> => (false));

			const deletedUser = await userService.delete(userEntity.getId(), { softDelete: true });
			expect(userRepositoryMock.deleteOne).toHaveBeenCalledTimes(1);
			expect(deletedUser).toBe(true);

			const deletedUserPreference = await userPreferenceService.delete(1, { softDelete: false });
			expect(userPreferenceRepositoryMock.deleteOne).toHaveBeenCalledTimes(1);
			expect(deletedUserPreference).toBe(false);
		});

		test('Should get a null user and preference', async () => {
			userRepositoryMock.deleteOne.mockImplementation(async (id: number, softDelete?: boolean, agentId?: string | number | null): Promise<boolean> => (false));
			userPreferenceRepositoryMock.deleteOne.mockImplementation(async (id: number, softDelete?: boolean, agentId?: string | number | null): Promise<boolean> => (false));

			const deletedUser = await userService.delete(1, { softDelete: true });
			expect(userRepositoryMock.deleteOne).toHaveBeenCalledTimes(1);
			expect(deletedUser).toBe(false);

			const deletedUserPreference = await userPreferenceService.delete(1, { softDelete: false });
			expect(userPreferenceRepositoryMock.deleteOne).toHaveBeenCalledTimes(1);
			expect(deletedUserPreference).toBe(false);
		});
	});

	afterAll(async () => {
		await nestTestingModule.close();
	});
});
