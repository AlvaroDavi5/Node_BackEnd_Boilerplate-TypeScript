import { ReadStream } from 'fs';
import FileReaderHelper from '../../../../../../src/modules/common/utils/helpers/FileReader.helper';
import DataParserHelper from '../../../../../../src/modules/common/utils/helpers/DataParser.helper';
import { configServiceMock } from '../../../../../../src/dev/mocks/mockedModules';


describe('Modules :: Common :: Utils :: Helpers :: FileReaderHelper', () => {
	const fileReaderHelper = new FileReaderHelper(configServiceMock as any, new DataParserHelper(configServiceMock as any));

	describe('# Invalid File Path', () => {
		const filePath = './invalidFile.txt';

		test('Should return undefined string', () => {
			const content = fileReaderHelper.readFile(filePath);

			expect(content).toBeUndefined();
		});

		test('Should return undefined stream', () => {
			let stream: ReadStream | undefined = undefined;

			try {
				stream = fileReaderHelper.readStream(filePath, 'utf8');
			} catch (error) {
				expect(stream?.readable).toBeUndefined();
			}
		});
	});

	describe('# Valid File Path', () => {
		const filePath = 'src/dev/templates/LICENSE.example.txt';

		test('Should return the content string', () => {
			const content = fileReaderHelper.readFile(filePath);
			expect(content).toContain('MIT License');
		});

		test('Should return the content stream', () => {
			const stream = fileReaderHelper.readStream(filePath, 'utf8');

			expect(stream?.readable).toBe(true);
		});
	});
});
