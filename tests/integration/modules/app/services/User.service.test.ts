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
		deleteOne: jest.fn(async (id: number, softDelete?: boolean, agentId?: string | number | null): Promise<[affectedCount: number] | null> => (null)),
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

	describe('# Get User', () => {
		it('Should return a user with a valid ID', async () => {
			const userEntity = new UserEntity({ id: 1, email: 'user.test@nomail.test' });
			userRepositoryMock.getById.mockImplementation(async (id: number, restrictData?: boolean): Promise<UserEntity | null> => {
				if (id === userEntity.getId()) return userEntity;
				else return null;
			});
			const user = await userService.getById(1);

			expect(userRepositoryMock.getById).toBeCalled();
			expect(user?.getId()).toBe(userEntity.getId());
		});
	});

	afterAll(async () => {
		await nestTestingModule.close();
	});
});
