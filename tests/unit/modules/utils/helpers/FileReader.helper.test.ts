import { Test, TestingModule } from '@nestjs/testing';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import path from 'path';
import FileReaderHelper from '../../../../../src/modules/utils/helpers/FileReader.helper';
import LoggerGenerator from '../../../../../src/infra/logging/LoggerGenerator.logger';


const moduleMocker = new ModuleMocker(global);

describe('Modules :: Utils :: Helpers :: FileReaderHelper', () => {
	let fileReaderHelper: FileReaderHelper;
	// // mocks
	const warnLogger = jest.fn((...logs: any[]): void => { });

	// ? build test app
	beforeEach(async () => {
		const nestTestApp: TestingModule = await Test.createTestingModule({
			providers: [FileReaderHelper],
		})
			.useMocker((injectionToken) => {
				if (injectionToken === LoggerGenerator) {
					return ({
						getLogger: () => ({
							warn: warnLogger,
						}),
					});
				}
				if (typeof injectionToken === 'function') {
					const mockMetadata = moduleMocker.getMetadata(injectionToken) as MockFunctionMetadata<any, any>;
					const Mock = moduleMocker.generateFromMetadata(mockMetadata);
					return new Mock();
				}
			})
			.compile();

		// * get app provider
		fileReaderHelper = nestTestApp.get<FileReaderHelper>(FileReaderHelper);
	});

	describe('# Invalid File Path', () => {
		it('Should return null', async () => {
			const filePath = './invalidFile.txt';
			expect(await fileReaderHelper.read(filePath)).toBeNull();
			expect(warnLogger).toHaveBeenCalledWith('File read error:', `ENOENT: no such file or directory, open '${filePath}'`);
		});
	});

	describe('# Valid File Path', () => {
		it('Should return the content string', async () => {
			const filePath = path.resolve(__dirname, '../../../../../LICENSE.txt');
			const content = await fileReaderHelper.read(filePath);
			expect(warnLogger).not.toHaveBeenCalled();
			expect(content).toContain('MIT License');
		});
	});
});
