import formatMessageBeforeSendHelper from '../../../../src/interface/webSocket/helpers/formatMessageBeforeSendHelper';


describe('Interface :: WebSocket :: Helpers :: FormatMessageBeforeSendHelper', () => {
	const helper = formatMessageBeforeSendHelper();

	describe('# execute with a object', () => {
		it('should stringify object successfully', async () => {
			const data = {
				name: 'tester',
				age: 29,
			};

			const formatMessageBeforeSendHelperResult = helper.execute(data);
			expect(formatMessageBeforeSendHelperResult).toEqual('{"name":"tester","age":29}');
		});
	});
	describe('# execute with another type of data', () => {
		it('should return the same string', async () => {
			const data = 1;

			const formatMessageBeforeSendHelperResult = helper.execute(data);
			expect(formatMessageBeforeSendHelperResult).toEqual('1');
		});
	});
	describe('# execute with a invalid object', () => {
		it('should return a empty string', async () => {
			const data = undefined;

			const formatMessageBeforeSendHelperResult = helper.execute(data);
			expect(formatMessageBeforeSendHelperResult).toEqual('""');
		});
	});
});