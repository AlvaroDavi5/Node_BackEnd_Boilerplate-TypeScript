import CacheAccessHelper from '../../../../../../src/modules/common/utils/helpers/CacheAccess.helper';


describe('Modules :: Common :: Utils :: Helpers :: CacheAccessHelper', () => {
	const cacheAccessHelper = new CacheAccessHelper();

	describe('# Key-ID', () => {
		test('Should return a key', () => {
			const key = cacheAccessHelper.generateKey('#1', 'users');
			expect(key).toBe('users:#1');
		});

		test('Should return a ID', () => {
			const id = cacheAccessHelper.getId('users:#1', 'users');
			expect(id).toBe('#1');
		});
	});

	describe('# Key-ID Without Pattern', () => {
		test('Should return a key', () => {
			const key = cacheAccessHelper.generateKey('#1');
			expect(key).toBe(':#1');
		});

		test('Should return a ID', () => {
			const id = cacheAccessHelper.getId(':#1');
			expect(id).toBe('#1');
		});
	});
});
