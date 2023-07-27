import { Test, TestingModule } from '@nestjs/testing';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import UserStrategy from '../../../../../src/modules/app/strategies/User.strategy';
import UserEntity from '../../../../../src/modules/app/domain/entities/User.entity';


const moduleMocker = new ModuleMocker(global);

describe('Modules :: App :: Strategies :: UserStrategy', () => {
	let userStrategy: UserStrategy;

	// ? build test app
	beforeEach(async () => {
		const nestTestApp: TestingModule = await Test.createTestingModule({
			providers: [UserStrategy],
		})
			.useMocker((injectionToken) => {
				if (typeof injectionToken === 'function') {
					const mockMetadata = moduleMocker.getMetadata(injectionToken) as MockFunctionMetadata<any, any>;
					const Mock = moduleMocker.generateFromMetadata(mockMetadata);
					return new Mock();
				}
			})
			.compile();

		// * get app provider
		userStrategy = nestTestApp.get<UserStrategy>(UserStrategy);
	});

	describe('# Same Agent is Allowed', () => {
		it('Should return true', () => {
			const userEntity = new UserEntity({ email: 'user.test@nomail.test' });
			const userAgent = { username: 'user.test@nomail.test', clientId: '#1' };
			expect(userStrategy.isAllowed(userEntity, userAgent)).toBe(true);
		});
	});

	describe('# Another Agent is Allowed', () => {
		it('Should return false', () => {
			const userEntity = new UserEntity({ email: 'user.test@nomail.test' });
			const userAgent = { username: 'tester@nomail.test', clientId: '#2' };
			expect(userStrategy.isAllowed(userEntity, userAgent)).toBe(false);
		});
	});
});
