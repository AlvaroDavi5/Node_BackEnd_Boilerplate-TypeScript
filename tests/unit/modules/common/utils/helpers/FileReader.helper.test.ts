import { ReadStream } from 'fs';
import FileReaderHelper from '../../../../../../src/modules/common/utils/helpers/FileReader.helper';


describe('Modules :: Common :: Utils :: Helpers :: FileReaderHelper', () => {
	// // mocks
	const warnLoggerMock = jest.fn();
	const loggerProviderMock = {
		getLogger: () => ({
			warn: warnLoggerMock,
		}),
	};

	const fileReaderHelper = new FileReaderHelper(loggerProviderMock);

	describe('# Invalid File Path', () => {
		const filePath = './invalidFile.txt';

		test('Should return undefined string', () => {
			const content = fileReaderHelper.readFile(filePath);

			expect(content).toBeUndefined();
			expect(warnLoggerMock).toHaveBeenCalled();
		});

		test('Should return undefined stream', () => {
			let stream: ReadStream | undefined = undefined;

			try {
				stream = fileReaderHelper.readStream(filePath, 'utf8');
			} catch (error) {
				expect(stream?.readable).toBeUndefined();
				expect(warnLoggerMock).toHaveBeenCalled();
			}
		});
	});

	describe('# Valid File Path', () => {
		const filePath = 'src/dev/templates/LICENSE.txt';

		test('Should return the content string', () => {
			const content = fileReaderHelper.readFile(filePath);
			expect(warnLoggerMock).not.toHaveBeenCalled();
			expect(content).toContain('MIT License');
		});

		test('Should return the content stream', () => {
			const stream = fileReaderHelper.readStream(filePath, 'utf8');

			expect(warnLoggerMock).not.toHaveBeenCalled();
			expect(stream?.readable).toBe(true);
		});
	});
});
