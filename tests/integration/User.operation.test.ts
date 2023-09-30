import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import configs from '../../src/configs/configs.config';
import UserStrategy from '../../src/modules/app/strategies/User.strategy';
import UserOperation from '../../src/modules/app/operations/User.operation';
import UserService from '../../src/modules/app/services/User.service';
import UserPreferenceService from '../../src/modules/app/services/UserPreference.service';
import UserRepository from '../../src/modules/app/repositories/user/User.repository';
import UserPreferenceRepository from '../../src/modules/app/repositories/userPreference/UserPreference.repository';
import Exceptions from '../../src/infra/errors/Exceptions';
import UserEntity from '../../src/modules/app/domain/entities/User.entity';
import UserPreferenceEntity from '../../src/modules/app/domain/entities/UserPreference.entity';


describe('Modules :: App :: Operations :: UserOperation', () => {
	let userOperation: UserOperation;
	// // mocks
	const userRepositoryMock = {
		getById: jest.fn(async (id: number, restrictData?: boolean): Promise<UserEntity | null> => (null)),
		create: jest.fn(async (data: any): Promise<any> => (null)),
		update: jest.fn(async (id: number, data: any): Promise<any> => (null)),
		deleteOne: jest.fn(async (id: number, softDelete?: boolean, agentId?: string | number | null): Promise<any> => (null)),
		list: jest.fn(async (query?: any, restrictData?: boolean): Promise<any> => ({ content: [], pageNumber: 0, pageSize: 0, totalPages: 0, totalItems: 0 })),
	};
	const userPreferenceRepositoryMock = {
		getById: jest.fn(async (id: number, restrictData?: boolean): Promise<UserEntity | null> => (null)),
		create: jest.fn(async (data: any): Promise<any> => (null)),
		update: jest.fn(async (id: number, data: any): Promise<any> => (null)),
		deleteOne: jest.fn(async (id: number, softDelete?: boolean, agentId?: string | number | null): Promise<any> => (null)),
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
		const nestTestingModule: TestingModule = await Test.createTestingModule({
			providers: [
				UserStrategy,
				UserOperation,
				UserService,
				UserPreferenceService,
				{ provide: UserRepository, useValue: userRepositoryMock },
				{ provide: UserPreferenceRepository, useValue: userPreferenceRepositoryMock },
				Exceptions,
				{ provide: ConfigService, useValue: configServiceMock },
			]
		}).compile();

		// * get app provider
		userOperation = nestTestingModule.get<UserOperation>(UserOperation);
	});

	describe('# Get User', () => {
		it('Should return a user with a valid ID', async () => {
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test' });
			userRepositoryMock.getById.mockImplementation(async (id: number, restrictData?: boolean): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});
			const user = await userOperation.getUser(1, { username: 'tester' });

			expect(userRepositoryMock.getById).toBeCalled();
			expect(user?.getId()).toBe(userEntity.getId());
		});
	});
});
