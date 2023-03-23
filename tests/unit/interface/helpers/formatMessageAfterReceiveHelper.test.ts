import formatMessageAfterReceiveHelper from '../../../../src/interface/webSocket/helpers/formatMessageAfterReceiveHelper';


describe('Interface :: WebSocket :: Helpers :: FormatMessageAfterReceiveHelper', () => {
	const helper = formatMessageAfterReceiveHelper();

	describe('# execute with a object', () => {
		it('should return the same object', async () => {
			const data = {
				name: 'tester',
				age: 29,
			};

			const formatMessageAfterReceiveHelperResult = helper.execute(data);
			expect(formatMessageAfterReceiveHelperResult).toEqual(data);
		});
	});
	describe('# execute with a stringified object', () => {
		it('should parse object successfully', async () => {
			const data = {
				name: 'tester',
				age: 29,
			};

			const formatMessageAfterReceiveHelperResult = helper.execute('{"name":"tester","age":29}');
			expect(formatMessageAfterReceiveHelperResult).toEqual(data);
		});
	});
	describe('# execute with a string data', () => {
		it('should return the same string', async () => {
			const data = 'testing';

			const formatMessageAfterReceiveHelperResult = helper.execute(data);
			expect(formatMessageAfterReceiveHelperResult).toEqual('testing');
		});
	});
	describe('# execute without message data', () => {
		it('should return a empty string', async () => {
			const data = undefined;

			const formatMessageAfterReceiveHelperResult = helper.execute(data);
			expect(formatMessageAfterReceiveHelperResult).toEqual('');
		});
	});
});
