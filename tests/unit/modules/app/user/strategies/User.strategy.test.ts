import UserEntity from '@domain/entities/User.entity';
import UserStrategy from '@app/user/strategies/User.strategy';


describe('Modules :: App :: User :: Strategies :: UserStrategy', () => {
	const userStrategy = new UserStrategy();

	describe('# Allowed to Manage User', () => {
		describe('# Same Agent is Allowed', () => {
			test('Should return true', () => {
				const agentUser = { username: 'user.test@nomail.test', clientId: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d' };
				const userEntity = new UserEntity({ id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
				expect(userStrategy.isAllowedToManageUser(agentUser, userEntity)).toBe(true);
			});
		});

		describe('# Another Agent is Not Allowed', () => {
			test('Should return false due ID', () => {
				const agentUser = { username: 'user.test@nomail.test', clientId: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d' };
				const userEntity = new UserEntity({ id: 'b5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
				expect(userStrategy.isAllowedToManageUser(agentUser, userEntity)).toBe(false);
			});
			test('Should return false due username', () => {
				const agentUser = { username: 'tester@nomail.test', clientId: 'b5483856-1bf7-4dae-9c21-d7ea4dd30d1d' };
				const userEntity = new UserEntity({ id: 'b5483856-1bf7-4dae-9c21-d7ea4dd30d1d', email: 'user.test@nomail.test' });
				expect(userStrategy.isAllowedToManageUser(agentUser, userEntity)).toBe(false);
			});
		});
	});

	describe('# Must Update Fields', () => {
		describe('# No Attributes', () => {
			test('Should return false due empty entity atrributes', () => {
				expect(userStrategy.mustUpdate({}, {})).toBe(false);
			});

			test('Should return false due empty input atrributes', () => {
				expect(userStrategy.mustUpdate({ name: 'Test' }, {})).toBe(false);
			});
		});

		describe('# Same Attributes', () => {
			test('Should return false due same atrributes', () => {
				expect(userStrategy.mustUpdate({ name: 'Test' }, { name: 'Test' })).toBe(false);
			});
		});

		describe('# Different Attributes', () => {
			test('Should return true', () => {
				expect(userStrategy.mustUpdate({ name: 'Test' }, { name: 'Updated Test' })).toBe(true);
			});
			test('Should return true for nested objects', () => {
				expect(userStrategy.mustUpdate({ details: { age: 30 } }, { details: { age: 31 } })).toBe(true);
			});
		});
	});
});
