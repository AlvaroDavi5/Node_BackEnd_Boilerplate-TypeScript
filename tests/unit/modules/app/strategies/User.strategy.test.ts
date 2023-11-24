import UserStrategy from '../../../../../src/modules/app/strategies/User.strategy';
import UserEntity from '../../../../../src/modules/app/domain/entities/User.entity';


describe('Modules :: App :: Strategies :: UserStrategy', () => {
	const userStrategy = new UserStrategy();

	describe('# Same Agent is Allowed', () => {
		test('Should return true', () => {
			const userAgent = { username: 'user.test@nomail.test', clientId: '#1' };
			const userEntity = new UserEntity({ email: 'user.test@nomail.test' });
			expect(userStrategy.isAllowedToManageUser(userAgent, userEntity)).toBe(true);
		});
	});

	describe('# Another Agent is Allowed', () => {
		test('Should return false', () => {
			const userAgent = { username: 'tester@nomail.test', clientId: '#2' };
			const userEntity = new UserEntity({ email: 'user.test@nomail.test' });
			expect(userStrategy.isAllowedToManageUser(userAgent, userEntity)).toBe(false);
		});
	});
});
