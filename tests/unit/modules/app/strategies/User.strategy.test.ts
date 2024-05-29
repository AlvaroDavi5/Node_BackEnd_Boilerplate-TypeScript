import UserStrategy from '../../../../../src/modules/app/user/strategies/User.strategy';
import UserEntity from '../../../../../src/modules/domain/entities/User.entity';


describe('Modules :: App :: Strategies :: UserStrategy', () => {
	const userStrategy = new UserStrategy();

	describe('# Same Agent is Allowed', () => {
		test('Should return true', () => {
			const userAgent = { username: 'user.test@nomail.test', clientId: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d' };
			const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			expect(userStrategy.isAllowedToManageUser(userAgent, userEntity)).toBe(true);
		});
	});

	describe('# Another Agent is Allowed', () => {
		test('Should return false due ID', () => {
			const userAgent = { username: 'user.test@nomail.test', clientId: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d' };
			const userEntity = new UserEntity({ id: 'b5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			expect(userStrategy.isAllowedToManageUser(userAgent, userEntity)).toBe(false);
		});
		test('Should return false due username', () => {
			const userAgent = { username: 'tester@nomail.test', clientId: 'b5483856-1bf7-4dae-9c21-d7ea4dd30d1d' };
			const userEntity = new UserEntity({ id: 'b5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
			expect(userStrategy.isAllowedToManageUser(userAgent, userEntity)).toBe(false);
		});
	});
});
