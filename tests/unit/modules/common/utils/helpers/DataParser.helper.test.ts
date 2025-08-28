import { Readable } from 'stream';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';


describe('Modules :: Common :: Utils :: Helpers :: DataParserHelper', () => {
	const dataParserHelper = new DataParserHelper();
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

		test('Should return a stringified object with circular reference', () => {
			const obj = { user: { id: 1 }, self: null as any };
			obj.self = obj;

			const stringifiedUser = dataParserHelper.toString(obj);
			expect(stringifiedUser).toBe('{"user":{"id":1},"self":"[Circular]"}');
		});

		test('Should return a stringified array with error and circular reference', () => {
			const error = new Error('Test Error');
			const arr = [{ id: 1 }, error, null as any];
			arr[2] = arr;

			const stringifiedUser = dataParserHelper.toString(arr);
			expect(stringifiedUser).toBe('{"id":1}, Error: Test Error, [Circular]');
		});

		test('Should return a stringified null object', () => {
			expect(dataParserHelper.toString(null)).toBe('null');
		});

		test('Should return a stringified undefined', () => {
			expect(dataParserHelper.toString(undefined, true)).toBe('undefined');
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
		test('Should return null', () => {
			let parsedUser;

			try {
				parsedUser = dataParserHelper.toObject('{user:{id:1}}');
			} catch (_error) {
				expect(parsedUser).toBeNull();
			}
		});
	});

	describe('# Parse to Buffer', () => {
		test('Should parse base64 to string', async () => {
			const buffer = await dataParserHelper.toBuffer('QUJD', 'base64');
			expect(buffer.toString('utf8')).toBe('ABC');
		});

		test('Should parse blob to string', async () => {
			const blob = new Blob(['TEST'], { type: 'text/plain' });
			const buffer = await dataParserHelper.toBuffer(blob, 'utf8');
			expect(buffer.toString('utf8')).toBe('TEST');
		});

		test('Should parse uint8 array to string', async () => {
			const uint8Array = new Uint8Array([65, 66, 67]);
			const buffer = await dataParserHelper.toBuffer(uint8Array, 'utf8');
			expect(buffer.toString('utf8')).toBe('ABC');
		});

		test('Should parse readable to string', async () => {
			const readableStream = Readable.from([Buffer.from('Hello'), Buffer.from(' '), Buffer.from('World')]);
			const buffer = await dataParserHelper.toBuffer(readableStream, 'utf8');
			expect(buffer.toString('utf8')).toBe('Hello World');
		});

		test('Should parse readable stream to string', async () => {
			const readableStream = new ReadableStream({
				start(controller) {
					controller.enqueue(new TextEncoder().encode('Hello World'));
					controller.close();
				}
			});
			const buffer = await dataParserHelper.toBuffer(readableStream, 'utf8');
			expect(buffer.toString('utf8')).toBe('Hello World');
		});
	});

});
