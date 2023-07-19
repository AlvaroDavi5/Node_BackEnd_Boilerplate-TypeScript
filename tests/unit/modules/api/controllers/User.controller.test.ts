import { Test, TestingModule } from '@nestjs/testing';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import UserController from '../../../../../src/modules/api/controllers/User.controller';
import UserOperation from '../../../../../src/modules/app/operations/User.operation';
import UserEntity from '../../../../../src/modules/app/domain/entities/User.entity';


const moduleMocker = new ModuleMocker(global);

describe('Modules :: Api :: Controllers :: UserController', () => {
	let userController: UserController;

	// ? build test app
	beforeEach(async () => {
		const nestTestApp: TestingModule = await Test.createTestingModule({
			controllers: [UserController],
		})
			.useMocker((token) => {
				if (token === UserOperation) {
					return {
						getUser: jest.fn((userId, user) => {
							if (userId && user)
								return new UserEntity({ id: userId });
							else
								return null;
						})
					};
				}
				if (typeof token === 'function') {
					const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
					const Mock = moduleMocker.generateFromMetadata(mockMetadata);
					return new Mock();
				}
			})
			.compile();

		// * get app provider
		userController = nestTestApp.get<UserController>(UserController);
	});

	describe('# Get User', () => {
		it('Should return a user with valid ID', async () => {
			const user = await userController.getUser({ user: {} }, 1);

			expect(user?.getId()).toBe(new UserEntity({ id: 1 }).getId());
		});
	});
});
