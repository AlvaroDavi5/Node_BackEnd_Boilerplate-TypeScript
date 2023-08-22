import UserEntity from '../../../../../../src/modules/app/domain/entities/User.entity';
import UserPreferenceEntity from '../../../../../../src/modules/app/domain/entities/UserPreference.entity';


describe('Modules :: App :: Domain :: Entities :: UserEntities', () => {

	describe('# Instances', () => {
		const userEntity = new UserEntity({
			fullName: 'Test User',
			email: 'user.test@nomail.test',
			password: undefined,
			phone: '+5527999999999',
			preference: undefined,
		});
		userEntity.setPreference(new UserPreferenceEntity({
			userId: userEntity.getId(),
			imagePath: './',
			defaultTheme: 'DEFAULT',
		}));

		test('Validate fields', () => {
			expect(userEntity.getId()).toBe(0);
			userEntity.setDocInfos('12312312312', 'CPF', 'ES');
			expect(userEntity.getPhone()).toBe('+5527999999999');
			userEntity.setLogin('user.test@nomail.test', 'Test User');
			expect(userEntity.getLogin().email).toBe('user.test@nomail.test');
			expect(userEntity.updatedAt).not.toBeNull();
			userEntity.setPassword('admin');
			expect(userEntity.getPassword()).toBe('admin');
			expect(userEntity.createdAt).not.toBeNull();
			userEntity.setDeletedBy('test');
			expect(userEntity.getDeletedBy()).toBe('test');
			expect(userEntity.deletedAt).not.toBeNull();
			expect(userEntity.getPreference()?.getAttributes().userId).toBe(userEntity.getAttributes().id);
			expect(userEntity.getPreference()?.getId()).toBe(0);
			userEntity.getPreference()?.setImagePath('./image.png');
			expect(userEntity.getPreference()?.getImagePath()).toBe('./image.png');
			expect(userEntity.getPreference()?.getDefaultTheme()).toBe('DEFAULT');
			expect(userEntity.getPreference()?.createdAt).toBeDefined();
		});
	});
});
