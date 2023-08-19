import { Test, TestingModule } from '@nestjs/testing';
import CacheAccessHelper from './CacheAccess.helper';


describe('Modules :: Utils :: Helpers :: CacheAccessHelper', () => {
	let nestTestApp: TestingModule;

	let cacheAccessHelper: CacheAccessHelper;

	beforeEach(async () => {
		// ? build test app
		nestTestApp = await Test.createTestingModule({
			providers: [
				CacheAccessHelper,
			],
		}).compile();

		// * get app provider
		cacheAccessHelper = nestTestApp.get<CacheAccessHelper>(CacheAccessHelper);
	});

	afterEach(() => {
		nestTestApp.close();
	});

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
