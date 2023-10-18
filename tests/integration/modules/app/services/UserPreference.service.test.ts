import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import configs from '../../../../../src/configs/configs.config';
import UserPreferenceService from '../../../../../src/modules/app/services/UserPreference.service';
import UserPreferenceRepository from '../../../../../src/modules/app/repositories/userPreference/UserPreference.repository';
import Exceptions from '../../../../../src/infra/errors/Exceptions';
import UserPreferenceEntity from '../../../../../src/modules/app/domain/entities/UserPreference.entity';


describe('Modules :: App :: Services :: UserPreferenceService', () => {
	let nestTestingModule: TestingModule;
	let userPreferenceService: UserPreferenceService;
	// // mocks
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
				UserPreferenceService,
				{ provide: UserPreferenceRepository, useValue: userPreferenceRepositoryMock },
				Exceptions,
				{ provide: ConfigService, useValue: configServiceMock },
			]
		}).compile();

		// * get app provider
		userPreferenceService = nestTestingModule.get<UserPreferenceService>(UserPreferenceService);
	});

	describe('# Create User Preference', () => {

		test('Should create a user preference successfully', async () => {
			userPreferenceRepositoryMock.create.mockImplementation(async (data: any): Promise<UserPreferenceEntity | null> => (new UserPreferenceEntity(data)));

			const createdUserPreference = await userPreferenceService.create({
				userId: 1,
				defaultTheme: 'DARK',
			});
			expect(userPreferenceRepositoryMock.create).toHaveBeenCalledTimes(1);
			expect(createdUserPreference?.getUserId()).toBe(1);
			expect(createdUserPreference?.getDefaultTheme()).toBe('DARK');
		});

		test('Should not create a user preference', async () => {
			userPreferenceRepositoryMock.create.mockImplementation(async (data: any): Promise<UserPreferenceEntity | null> => (null));

			const createdUserPreference = await userPreferenceService.create({
				userId: 1,
				defaultTheme: 'DARK',
			});
			expect(userPreferenceRepositoryMock.create).toHaveBeenCalledTimes(1);
			expect(createdUserPreference).toBeNull();
		});
	});

	describe('# Get User Preference', () => {

		test('Should find a user preference successfully', async () => {
			const userPreferenceEntity = new UserPreferenceEntity({ id: 1, userId: 1 });
			userPreferenceRepositoryMock.findOne.mockImplementation(async (query: any): Promise<UserPreferenceEntity | null> => {
				if (query?.userId === userPreferenceEntity.getUserId()) return userPreferenceEntity;
				else return null;
			});

			const userPreference = await userPreferenceService.getByUserId(1);
			expect(userPreferenceRepositoryMock.findOne).toHaveBeenCalledTimes(1);
			expect(userPreference?.getUserId()).toBe(1);
		});

		test('Should not find a user preference', async () => {
			userPreferenceRepositoryMock.findOne.mockImplementation(async (query: any): Promise<UserPreferenceEntity | null> => (null));

			const userPreference = await userPreferenceService.getByUserId(1);
			expect(userPreferenceRepositoryMock.findOne).toHaveBeenCalledTimes(1);
			expect(userPreference).toBeNull();
		});
	});

	describe('# Update User Preference', () => {

		test('Should update a user preference successfully', async () => {
			const userPreferenceEntity = new UserPreferenceEntity({ id: 1, userId: 1, defaultTheme: 'DEFAULT' });
			userPreferenceRepositoryMock.update.mockImplementation(async (id: number, data: any): Promise<UserPreferenceEntity | null> => {
				if (id !== userPreferenceEntity.getId()) return null;
				if (data?.defaultTheme) userPreferenceEntity.setDefaultTheme(data.defaultTheme);
				return userPreferenceEntity;
			});

			const updatedUserPreference = await userPreferenceService.update(1, {
				defaultTheme: 'DARK',
			});
			expect(userPreferenceRepositoryMock.update).toHaveBeenCalledTimes(1);
			expect(updatedUserPreference?.getDefaultTheme()).toBe('DARK');
		});

		test('Should not update a user preference', async () => {
			userPreferenceRepositoryMock.update.mockImplementation(async (id: number, data: any): Promise<UserPreferenceEntity | null> => (null));

			const updatedUserPreference = await userPreferenceService.update(1, {
				defaultTheme: 'DARK',
			});
			expect(userPreferenceRepositoryMock.update).toHaveBeenCalledTimes(1);
			expect(updatedUserPreference).toBeNull();
		});
	});

	describe('# Delete User Preference', () => {

		test('Should delete a user preference successfully', async () => {
			const userPreferenceEntity = new UserPreferenceEntity({ id: 1, userId: 1 });
			userPreferenceRepositoryMock.deleteOne.mockImplementation(async (id: number, softDelete?: boolean, agentId?: string | number | null): Promise<boolean> => {
				if (id === userPreferenceEntity.getId())
					return true;
				return false;
			});

			const deletedUserPreference = await userPreferenceService.delete(userPreferenceEntity?.getId(), { softDelete: false });
			expect(userPreferenceRepositoryMock.deleteOne).toHaveBeenCalledTimes(1);
			expect(deletedUserPreference).toBe(true);
		});

		test('Should not delete a user preference', async () => {
			userPreferenceRepositoryMock.deleteOne.mockImplementation(async (id: number, softDelete?: boolean, agentId?: string | number | null): Promise<boolean> => (false));

			const deletedUserPreference = await userPreferenceService.delete(1, { softDelete: false });
			expect(userPreferenceRepositoryMock.deleteOne).toHaveBeenCalledTimes(1);
			expect(deletedUserPreference).toBe(false);
		});
	});

	afterAll(async () => {
		await nestTestingModule.close();
	});
});