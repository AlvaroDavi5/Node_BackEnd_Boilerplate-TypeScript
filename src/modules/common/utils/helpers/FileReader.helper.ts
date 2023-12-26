import { Injectable } from '@nestjs/common';
import { readFileSync, createReadStream, ReadStream } from 'fs';
import { join } from 'path';
import { Logger } from 'winston';
import LoggerGenerator from '@core/infra/logging/LoggerGenerator.logger';


@Injectable()
export default class FileReaderHelper {
	private readonly logger: Logger;

	constructor(
		private readonly loggerGenerator: LoggerGenerator,
	) {
		this.logger = this.loggerGenerator.getLogger();
	}

	public readFile(filePath: string, encoding?: BufferEncoding): string | undefined {
		let content: string | undefined = undefined;

		try {
			content = readFileSync(join(process.cwd(), filePath), { encoding: encoding || 'utf8' });
		} catch (error) {
			this.logger.warn('File read error:', error);
		}

		return content;
	}

	public readStream(filePath: string, encoding?: BufferEncoding): ReadStream | undefined {
		let readStream: ReadStream | undefined = undefined;

		try {
			readStream = createReadStream(join(process.cwd(), filePath), { encoding: encoding || 'utf8' });
		} catch (error) {
			this.logger.warn('File read stream error:', error);
		}

		return readStream;
	}
}
