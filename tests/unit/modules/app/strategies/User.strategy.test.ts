import UserStrategy from '../../../../../src/modules/app/strategies/User.strategy';
import UserEntity from '../../../../../src/modules/app/domain/entities/User.entity';


describe('Modules :: App :: Strategies :: UserStrategy', () => {
	let userStrategy: UserStrategy;

	beforeEach(() => {
		userStrategy = new UserStrategy();
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
