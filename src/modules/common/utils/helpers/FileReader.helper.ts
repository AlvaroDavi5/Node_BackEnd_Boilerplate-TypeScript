import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync, createReadStream, ReadStream } from 'fs';
import { join } from 'path';
import LoggerService from '@core/logging/Logger.service';
import DataParserHelper from './DataParser.helper';


@Injectable()
export default class FileReaderHelper {
	private readonly logger: LoggerService;

	constructor(
		private readonly configService: ConfigService,
		private readonly dataParserHelper: DataParserHelper,
	) {
		this.logger = new LoggerService(FileReaderHelper.name, this.configService, this.dataParserHelper);
	}

	public readFile(filePath: string, encoding?: BufferEncoding): string | undefined {
		let content: string | undefined;

		try {
			// eslint-disable-next-line security/detect-non-literal-fs-filename
			content = readFileSync(join(process.cwd(), filePath), { encoding: encoding ?? 'utf8' });
		} catch (error) {
			this.logger.error('File read error:', error);
		}

		return content;
	}

	public readStream(filePath: string, encoding?: BufferEncoding): ReadStream | undefined {
		let readStream: ReadStream | undefined;

		try {
			// eslint-disable-next-line security/detect-non-literal-fs-filename
			readStream = createReadStream(join(process.cwd(), filePath), { encoding: encoding ?? 'utf8' });
		} catch (error) {
			this.logger.error('File read stream error:', error);
		}

		return readStream;
	}
}
