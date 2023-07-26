import { Test, TestingModule } from '@nestjs/testing';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import DataParserHelper from '../../../../../src/modules/utils/helpers/DataParser.helper';
import LoggerGenerator from '../../../../../src/infra/logging/LoggerGenerator.logger';


const moduleMocker = new ModuleMocker(global);

describe('Modules :: Utils :: Helpers :: DataParserHelper', () => {
	let dataParserHelper: DataParserHelper;
	// // mocks
	const warnLogger = jest.fn((...logs: any[]): void => { });

	// ? build test app
	beforeEach(async () => {
		const nestTestApp: TestingModule = await Test.createTestingModule({
			providers: [DataParserHelper],
		})
			.useMocker((injectionToken) => {
				if (injectionToken === LoggerGenerator) {
					return ({
						getLogger: () => ({
							warn: warnLogger,
						}),
					});
				}
				if (typeof injectionToken === 'function') {
					const mockMetadata = moduleMocker.getMetadata(injectionToken) as MockFunctionMetadata<any, any>;
					const Mock = moduleMocker.generateFromMetadata(mockMetadata);
					return new Mock();
				}
			})
			.compile();

		// * get app provider
		dataParserHelper = nestTestApp.get<DataParserHelper>(DataParserHelper);
	});

	describe('# Valid Data To String', () => {
		it('Should return the same string', () => {
			expect(dataParserHelper.toString('ABC')).toBe('ABC');
		});

		it('Should return a stringified bigint', () => {
			expect(dataParserHelper.toString(BigInt(1))).toBe('1');
		});

		it('Should return a stringified number', () => {
			expect(dataParserHelper.toString(1)).toBe('1');
		});

		it('Should return a stringified boolean', () => {
			expect(dataParserHelper.toString(true)).toBe('true');
		});

		it('Should return a stringified object', () => {
			const stringifiedUser = dataParserHelper.toString({ user: { id: 1 } });
			expect(stringifiedUser).toBe('{"user":{"id":1}}');
		});

		it('Should return a stringified null object', () => {
			expect(dataParserHelper.toString(null)).toBe('null');
		});

		it('Should return a stringified symbol', () => {
			expect(dataParserHelper.toString(Symbol('TestSymbol'))).toBe('Symbol(TestSymbol)');
		});

		it('Should return a empty string', () => {
			expect(dataParserHelper.toString(undefined)).toBe('');
		});
	});

	describe('# Valid Data To Object', () => {
		it('Should return a parsed object', () => {
			const parsedUser = dataParserHelper.toObject('{"user":{"id":1}}');
			expect(parsedUser).toEqual({ user: { id: 1 } });
		});
	});

	describe('# Invalid Data To Object', () => {
		it('Should return the same data', () => {
			const parsedUser = dataParserHelper.toObject('{user:{id:1}}');
			expect(parsedUser).toEqual('{user:{id:1}}');
			expect(warnLogger).toHaveBeenCalledWith('String:Object parse error');
		});
	});
});
