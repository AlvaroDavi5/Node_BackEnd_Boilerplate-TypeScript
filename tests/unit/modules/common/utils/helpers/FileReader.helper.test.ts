import { resolve } from 'path';
import FileReaderHelper from '../../../../../../src/modules/common/utils/helpers/FileReader.helper';


describe('Modules :: Common :: Utils :: Helpers :: FileReaderHelper', () => {
	// // mocks
	const warnLoggerMock = jest.fn();
	const loggerGeneratorMock = {
		getLogger: () => ({
			warn: warnLoggerMock,
		}),
	};

	const fileReaderHelper = new FileReaderHelper(loggerGeneratorMock);

	describe('# Invalid File Path', () => {
		test('Should return null', () => {
			const filePath = './invalidFile.txt';
			expect(fileReaderHelper.readFile(filePath)).toBeUndefined();
			expect(warnLoggerMock).toHaveBeenCalledWith('File read error:', `ENOENT: no such file or directory, open '${filePath}'`);
		});
	});

	describe('# Valid File Path', () => {
		test('Should return the content string', () => {
			const filePath = resolve('src/dev/templates/LICENSE.txt');
			const content = fileReaderHelper.readFile(filePath);
			expect(warnLoggerMock).not.toHaveBeenCalled();
			expect(content).toContain('MIT License');
		});
	});
});
