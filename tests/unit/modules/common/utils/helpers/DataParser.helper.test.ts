import DataParserHelper from '../../../../../../src/modules/common/utils/helpers/DataParser.helper';


describe('Modules :: Utils :: Helpers :: DataParserHelper', () => {
	// // mocks
	const warnLoggerMock = jest.fn();
	const loggerGeneratorMock = {
		getLogger: () => ({
			warn: warnLoggerMock,
		}),
	};

	const dataParserHelper = new DataParserHelper(loggerGeneratorMock);

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
			expect(warnLoggerMock).toHaveBeenCalledWith('String:Object parse error');
		});
	});
});
