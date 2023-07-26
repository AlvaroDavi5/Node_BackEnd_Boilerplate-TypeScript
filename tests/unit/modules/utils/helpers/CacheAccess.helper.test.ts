import { Test, TestingModule } from '@nestjs/testing';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import CacheAccessHelper from '../../../../../src/modules/utils/helpers/CacheAccess.helper';


const moduleMocker = new ModuleMocker(global);

describe('Modules :: Utils :: Helpers :: CacheAccessHelper', () => {
	let cacheAccessHelper: CacheAccessHelper;

	// ? build test app
	beforeEach(async () => {
		const nestTestApp: TestingModule = await Test.createTestingModule({
			providers: [CacheAccessHelper],
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
		cacheAccessHelper = nestTestApp.get<CacheAccessHelper>(CacheAccessHelper);
	});

	describe('# Key-ID', () => {
		it('Should return a key', () => {
			const key = cacheAccessHelper.generateKey('#1', 'users');
			expect(key).toBe('users:#1');
		});

		it('Should return a ID', () => {
			const id = cacheAccessHelper.getId('users:#1', 'users');
			expect(id).toBe('#1');
		});
	});

	describe('# Key-ID Without Pattern', () => {
		it('Should return a key', () => {
			const key = cacheAccessHelper.generateKey('#1');
			expect(key).toBe(':#1');
		});

		it('Should return a ID', () => {
			const id = cacheAccessHelper.getId(':#1');
			expect(id).toBe('#1');
		});
	});
});
