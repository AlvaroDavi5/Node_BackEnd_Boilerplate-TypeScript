import { Injectable, Inject } from '@nestjs/common';
import { readFileSync, createReadStream, ReadStream } from 'fs';
import { join } from 'path';
import { Logger } from 'winston';
import { LOGGER_PROVIDER, LoggerProviderInterface } from '@core/infra/logging/Logger.provider';


@Injectable()
export default class FileReaderHelper {
	private readonly logger: Logger;

	constructor(
		@Inject(LOGGER_PROVIDER)
		private readonly loggerProvider: LoggerProviderInterface,
	) {
		this.logger = this.loggerProvider.getLogger(FileReaderHelper.name);
	}

	public readFile(filePath: string, encoding?: BufferEncoding): string | undefined {
		let content: string | undefined = undefined;

		try {
			content = readFileSync(join(process.cwd(), filePath), { encoding: encoding ?? 'utf8' });
		} catch (error) {
			this.logger.warn('File read error:', error);
		}

		return content;
	}

	public readStream(filePath: string, encoding?: BufferEncoding): ReadStream | undefined {
		let readStream: ReadStream | undefined = undefined;

		try {
			readStream = createReadStream(join(process.cwd(), filePath), { encoding: encoding ?? 'utf8' });
		} catch (error) {
			this.logger.warn('File read stream error:', error);
		}

		return readStream;
	}
}
