import UserEntity from '@domain/entities/User.entity';
import UserPreferenceEntity from '@domain/entities/UserPreference.entity';


describe('Modules :: Domain :: Entities :: UserEntities', () => {

	const currentDate = new Date();
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


		const otherUserEntity = new UserEntity({
			fullName: 'Test User',
			email: 'user.test@nomail.test',
			password: undefined,
			phone: '+5527999999999',
			preference: undefined,
			createdAt: currentDate,
			updatedAt: currentDate,
			deletedAt: currentDate,
		});
		otherUserEntity.setPreference(new UserPreferenceEntity({
			userId: otherUserEntity.getId(),
			createdAt: currentDate,
			updatedAt: currentDate,
			deletedAt: currentDate,
		}));

		test('Validate fields', () => {
			userEntity.setId('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d');
			expect(userEntity.getId()).toBe('a5483856-1bf7-4dae-9c21-d7ea4dd30d1d');
			userEntity.setDocInfos('12312312312', 'CPF', 'ES');
			expect(userEntity.getPhone()).toBe('+5527999999999');
			userEntity.setEmail('user.test@nomail.test');
			expect(userEntity.getEmail()).toBe('user.test@nomail.test');
			expect(userEntity.updatedAt).not.toBeNull();
			userEntity.setPassword('admin');
			expect(userEntity.getPassword()).toBe('admin');
			expect(userEntity.createdAt).not.toBeNull();
			userEntity.setDeletedBy('test');
			expect(userEntity.getDeletedBy()).toBe('test');
			expect(userEntity.deletedAt).not.toBeNull();
			expect(userEntity.getPreference()?.getUserId()).toBe(userEntity.getId());
			userEntity.getPreference()?.setId('a6483856-1bf7-4dae-9c21-d7ea4dd30d1d');
			expect(userEntity.getPreference()?.getId()).toBe('a6483856-1bf7-4dae-9c21-d7ea4dd30d1d');
			userEntity.getPreference()?.setImagePath('./image.png');
			expect(userEntity.getPreference()?.getImagePath()).toBe('./image.png');
			userEntity.getPreference()?.setDefaultTheme('DARK');
			expect(userEntity.getPreference()?.getDefaultTheme()).toBe('DARK');
			expect(userEntity.getPreference()?.createdAt).not.toBeNull();

			expect(otherUserEntity.getId()).toBeUndefined();
			otherUserEntity.getPreference()?.setDefaultTheme('INVALID');
			expect(otherUserEntity.getPreference()?.getDefaultTheme()).toBeNull();
			expect(otherUserEntity.createdAt).not.toBeNull();
			expect(otherUserEntity.updatedAt).not.toBeNull();
			expect(otherUserEntity.getDeletedBy()).toBeNull();
			expect(otherUserEntity.deletedAt).not.toBeNull();
			expect(otherUserEntity.getPreference()?.createdAt).not.toBeNull();
			expect(otherUserEntity.getPreference()?.updatedAt).not.toBeNull();
			expect(otherUserEntity.getPreference()?.deletedAt).not.toBeNull();
		});

		test('Validate all attributes', () => {
			expect(userEntity.getAttributes()).toMatchObject({
				id: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d',
				fullName: 'Test User',
				email: 'user.test@nomail.test',
				docType: 'CPF',
				document: '12312312312',
				password: 'admin',
				phone: '+5527999999999',
				fu: 'ES',
				preference: {
					id: 'a6483856-1bf7-4dae-9c21-d7ea4dd30d1d',
					userId: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d',
					defaultTheme: 'DARK',
					imagePath: './image.png',
					deletedAt: undefined,
				},
				deletedBy: 'test',
			});

			expect(userEntity.getPreference()?.getAttributes()).toMatchObject({
				id: 'a6483856-1bf7-4dae-9c21-d7ea4dd30d1d',
				userId: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d',
				defaultTheme: 'DARK',
				imagePath: './image.png',
				deletedAt: undefined,
			});
		});
	});
});
