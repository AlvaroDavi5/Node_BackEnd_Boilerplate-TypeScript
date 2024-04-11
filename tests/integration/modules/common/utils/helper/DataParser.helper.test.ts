import { Test, TestingModule } from '@nestjs/testing';
import DataParserHelper from '../../../../../../src/modules/common/utils/helpers/DataParser.helper';
import LoggerProviderMock from '../../../../support/mocks/logging/Logger.provider';
import { mockObservable } from '../../../../support/mocks/mockObservable';


describe('Modules :: Common :: Utils :: Helpers :: DataParserHelper', () => {
	let nestTestingModule: TestingModule;
	let dataParserHelper: DataParserHelper;
	// // mocks
	const loggerProviderMock = new LoggerProviderMock(mockObservable);
	const dataParserHelperMock = new DataParserHelper(loggerProviderMock); // ! mock instanced outside testing module due TypeError

	// ? build test app
	beforeAll(async () => {
		nestTestingModule = await Test.createTestingModule({
			providers: [
				{ provide: DataParserHelper, useValue: dataParserHelperMock },
			]
		}).compile();

		// * get app provider
		dataParserHelper = nestTestingModule.get<DataParserHelper>(DataParserHelper);
	});

	describe('# Valid Data To String', () => {
		test('Should return the same string', () => {
			expect(dataParserHelper.toString('ABC')).toBe('ABC');
		});

		test('Should return a stringified bigint', () => {
			expect(dataParserHelper.toString(BigInt(1))).toBe('1');
		});

		test('Should return a stringified number', () => {
			expect(dataParserHelper.toString(1)).toBe('1');
		});

		test('Should return a stringified boolean', () => {
			expect(dataParserHelper.toString(true)).toBe('true');
		});

		test('Should return a stringified object', () => {
			const stringifiedUser = dataParserHelper.toString({ user: { id: 1 } });
			expect(stringifiedUser).toBe('{"user":{"id":1}}');
		});

		test('Should return a stringified null object', () => {
			expect(dataParserHelper.toString(null)).toBe('null');
		});

		test('Should return a stringified symbol', () => {
			expect(dataParserHelper.toString(Symbol('TestSymbol'))).toBe('Symbol(TestSymbol)');
		});

		test('Should return a empty string', () => {
			expect(dataParserHelper.toString(undefined)).toBe('');
		});
	});

	describe('# Valid Data To Object', () => {
		test('Should return a parsed object', () => {
			const parsedUser = dataParserHelper.toObject('{"user":{"id":1}}');
			expect(parsedUser).toEqual({ user: { id: 1 } });
		});
	});

	describe('# Invalid Data To Object', () => {
		test('Should return the same data', () => {
			const parsedUser = dataParserHelper.toObject('{user:{id:1}}');
			expect(parsedUser).toEqual(null);
			expect(mockObservable.call).toHaveBeenCalledWith('String->Object parse error');
		});
	});
});
