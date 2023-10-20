import path from 'path';
import FileReaderHelper from '../../../../../../src/modules/common/utils/helpers/FileReader.helper';


describe('Modules :: Utils :: Helpers :: FileReaderHelper', () => {
	// // mocks
	const warnLoggerMock = jest.fn();
	const loggerGeneratorMock = {
		getLogger: () => ({
			warn: warnLoggerMock,
		}),
	};

	const fileReaderHelper = new FileReaderHelper(loggerGeneratorMock);

	describe('# Invalid File Path', () => {
		test('Should return null', async () => {
			const filePath = './invalidFile.txt';
			expect(await fileReaderHelper.read(filePath)).toBeNull();
			expect(warnLoggerMock).toHaveBeenCalledWith('File read error:', `ENOENT: no such file or directory, open '${filePath}'`);
		});
	});

	describe('# Valid File Path', () => {
		test('Should return the content string', async () => {
			const filePath = path.resolve(__dirname, '../../../../../../LICENSE.txt');
			const content = await fileReaderHelper.read(filePath);
			expect(warnLoggerMock).not.toHaveBeenCalled();
			expect(content).toContain('MIT License');
		});
	});
});
