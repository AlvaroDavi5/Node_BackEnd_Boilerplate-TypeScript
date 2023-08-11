import { Test, TestingModule } from '@nestjs/testing';
import UserStrategy from './User.strategy';
import UserEntity from '../../app/domain/entities/User.entity';


describe('Modules :: App :: Strategies :: UserStrategy', () => {
	let nestTestApp: TestingModule;

	let userStrategy: UserStrategy;

	// ? build test app
	beforeEach(async () => {
		nestTestApp = await Test.createTestingModule({
			providers: [
				UserStrategy,
			],
		}).compile();

		// * get app provider
		userStrategy = nestTestApp.get<UserStrategy>(UserStrategy);
	});

	afterEach(() => {
		nestTestApp.close();
	});

	describe('# Same Agent is Allowed', () => {
		test('Should return true', () => {
			const userEntity = new UserEntity({ email: 'user.test@nomail.test' });
			const userAgent = { username: 'user.test@nomail.test', clientId: '#1' };
			expect(userStrategy.isAllowed(userEntity, userAgent)).toBe(true);
		});
	});

	describe('# Another Agent is Allowed', () => {
		test('Should return false', () => {
			const userEntity = new UserEntity({ email: 'user.test@nomail.test' });
			const userAgent = { username: 'tester@nomail.test', clientId: '#2' };
			expect(userStrategy.isAllowed(userEntity, userAgent)).toBe(false);
		});
	});
});
