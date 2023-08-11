import { Test, TestingModule } from '@nestjs/testing';
import path from 'path';
import FileReaderHelper from './FileReader.helper';
import LoggerGenerator from '../../../infra/logging/LoggerGenerator.logger';


describe('Modules :: Utils :: Helpers :: FileReaderHelper', () => {
	let nestTestApp: TestingModule;

	let fileReaderHelper: FileReaderHelper;
	// // mocks
	const warnLoggerMock = jest.fn();
	const loggerGeneratorMock = {
		getLogger: () => ({
			warn: warnLoggerMock,
		}),
	};

	// ? build test app
	beforeEach(async () => {
		nestTestApp = await Test.createTestingModule({
			providers: [
				FileReaderHelper,
				{ provide: LoggerGenerator, useValue: loggerGeneratorMock },
			],
		}).compile();

		// * get app provider
		fileReaderHelper = nestTestApp.get<FileReaderHelper>(FileReaderHelper);
	});
	afterEach(() => {
		nestTestApp.close();
	});

	describe('# Invalid File Path', () => {
		test('Should return null', async () => {
			const filePath = './invalidFile.txt';
			expect(await fileReaderHelper.read(filePath)).toBeNull();
			expect(warnLoggerMock).toHaveBeenCalledWith('File read error:', `ENOENT: no such file or directory, open '${filePath}'`);
		});
	});

	describe('# Valid File Path', () => {
		test('Should return the content string', async () => {
			const filePath = path.resolve(__dirname, '../../../../LICENSE.txt');
			const content = await fileReaderHelper.read(filePath);
			expect(warnLoggerMock).not.toHaveBeenCalled();
			expect(content).toContain('MIT License');
		});
	});
});
