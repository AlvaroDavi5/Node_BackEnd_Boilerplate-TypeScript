import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { FindOneOptions } from 'typeorm';
import envsConfig from '@core/configs/envs.config';
import UserPreferencesModel from '@core/infra/database/models/UserPreferences.model';
import UserPreferenceService from '@app/user/services/UserPreference.service';
import UserPreferenceRepository from '@app/user/repositories/userPreference/UserPreference.repository';
import Exceptions from '@core/errors/Exceptions';
import UserPreferenceEntity from '@domain/entities/UserPreference.entity';


describe('Modules :: App :: User :: Services :: UserPreferenceService', () => {
	let nestTestingModule: TestingModule;
	let userPreferenceService: UserPreferenceService;
	// // mocks
	const userPreferenceRepositoryMock = {
		findOne: jest.fn(async (query: FindOneOptions<UserPreferencesModel>): Promise<UserPreferenceEntity | null> => (null)),
		create: jest.fn(async (entity: UserPreferenceEntity): Promise<UserPreferenceEntity> => { throw new Error('GenericError'); }),
		update: jest.fn(async (id: string, dataValues: Partial<UserPreferencesModel>): Promise<UserPreferenceEntity | null> => (null)),
		deleteOne: jest.fn(async (id: string, softDelete?: boolean): Promise<boolean> => (false)),
	};
	const configServiceMock = {
		get: (propertyPath?: string): any => {
			if (propertyPath) {
				const splitedPaths = propertyPath.split('.');
				let scopedProperty: any = envsConfig();

				for (let i = 0; i < splitedPaths.length; i++) {
					const scopedPath = splitedPaths[i];

					if (scopedPath.length)
						scopedProperty = scopedProperty[scopedPath];
				}

				return scopedProperty;
			} else
				return envsConfig();
		},
	};

	// ? build test app
	beforeAll(async () => {
		nestTestingModule = await Test.createTestingModule({
			providers: [
				{ provide: ConfigService, useValue: configServiceMock },
				Exceptions,
				{ provide: UserPreferenceRepository, useValue: userPreferenceRepositoryMock },
				UserPreferenceService,
			],
		}).compile();

		// * get app provider
		userPreferenceService = nestTestingModule.get<UserPreferenceService>(UserPreferenceService);
	});

	describe('# Create User Preference', () => {
		test('Should create a user preference successfully', async () => {
			userPreferenceRepositoryMock.create.mockResolvedValueOnce(new UserPreferenceEntity({
				userId: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d',
				defaultTheme: 'DARK',
			}));

			const createdUserPreference = await userPreferenceService.create(new UserPreferenceEntity({
				userId: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d',
				defaultTheme: 'DARK',
			}));
			expect(userPreferenceRepositoryMock.create).toHaveBeenCalledTimes(1);
			expect(createdUserPreference?.getUserId()).toBe('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d');
			expect(createdUserPreference?.getDefaultTheme()).toBe('DARK');
		});

		test('Should not create a user preference', async () => {
			await expect(userPreferenceService.create(new UserPreferenceEntity({
				userId: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d',
				defaultTheme: 'DARK',
			})))
				.rejects.toMatchObject({
					name: 'internal',
					message: 'Error to comunicate with database',
				});
			expect(userPreferenceRepositoryMock.create).toHaveBeenCalledTimes(1);
		});
	});

	describe('# Get User Preference', () => {
		test('Should find a user preference successfully', async () => {
			const userPreferenceEntity = new UserPreferenceEntity({ id: 'b5483856-1bf7-4dae-9c21-d7ea4dd30d1d', userId: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d' });
			userPreferenceRepositoryMock.findOne.mockResolvedValueOnce(userPreferenceEntity);

			const userPreference = await userPreferenceService.getByUserId('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d');
			expect(userPreferenceRepositoryMock.findOne).toHaveBeenCalledTimes(1);
			expect(userPreference?.getUserId()).toBe('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d');
		});

		test('Should not find a user preference', async () => {
			await expect(userPreferenceService.getByUserId('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d'))
				.rejects.toMatchObject({
					name: 'internal',
					message: 'Error to comunicate with database',
				});
			expect(userPreferenceRepositoryMock.findOne).toHaveBeenCalledTimes(1);
		});
	});

	describe('# Update User Preference', () => {
		test('Should update a user preference successfully', async () => {
			const userPreferenceEntity = new UserPreferenceEntity({ id: 'b5483856-1bf7-4dae-9c21-d7ea4dd30d1d', userId: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', defaultTheme: 'DEFAULT' });
			userPreferenceRepositoryMock.update.mockImplementationOnce(async (id: string, dataValues: Partial<UserPreferencesModel>): Promise<UserPreferenceEntity | null> => {
				if (dataValues?.defaultTheme) userPreferenceEntity.setDefaultTheme(dataValues.defaultTheme);
				if (dataValues?.imagePath) userPreferenceEntity.setImagePath(dataValues.imagePath);
				return userPreferenceEntity;
			});

			const updatedUserPreference = await userPreferenceService.update('b5483856-1bf7-4dae-9c21-d7ea4dd30d1d', new UserPreferenceEntity({
				defaultTheme: 'DARK',
			}).getAttributes());
			expect(userPreferenceRepositoryMock.update).toHaveBeenCalledTimes(1);
			expect(updatedUserPreference?.getDefaultTheme()).toBe('DARK');
		});

		test('Should not update a user preference', async () => {
			await expect(userPreferenceService.update('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', new UserPreferenceEntity({
				defaultTheme: 'DARK',
			}).getAttributes()))
				.rejects.toMatchObject({
					name: 'internal',
					message: 'Error to comunicate with database',
				});
			expect(userPreferenceRepositoryMock.update).toHaveBeenCalledTimes(1);
		});
	});

	describe('# Delete User Preference', () => {
		test('Should delete a user preference successfully', async () => {
			const userPreferenceEntity = new UserPreferenceEntity({ id: 1, userId: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d' });
			userPreferenceRepositoryMock.deleteOne.mockResolvedValueOnce(true);

			const deletedUserPreference = await userPreferenceService.delete(userPreferenceEntity?.getId(), { softDelete: false });
			expect(userPreferenceRepositoryMock.deleteOne).toHaveBeenCalledTimes(1);
			expect(deletedUserPreference).toBe(true);
		});

		test('Should not delete a user preference', async () => {
			userPreferenceRepositoryMock.deleteOne.mockResolvedValueOnce(false);

			const deletedUserPreference = await userPreferenceService.delete('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', { softDelete: false });
			expect(userPreferenceRepositoryMock.deleteOne).toHaveBeenCalledTimes(1);
			expect(deletedUserPreference).toBe(false);
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});
	afterAll(async () => {
		await nestTestingModule.close();
	});
});
