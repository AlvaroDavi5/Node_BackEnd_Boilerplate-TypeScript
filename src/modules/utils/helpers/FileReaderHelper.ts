import { Injectable } from '@nestjs/common';
import fs from 'fs';
import { Logger } from 'winston';
import LoggerGenerator from '@infra/logging/LoggerGenerator';


@Injectable()
export default class CacheAccessHelper {
	private readonly logger: Logger;

	constructor(
		private readonly loggerGenerator: LoggerGenerator,
	) {
		this.logger = this.loggerGenerator.getLogger();
	}

	public read(fileName: string): string | null {
		let content = null;
		const logger = this.logger;

		fs.readFile(fileName, 'utf8', function (err, data) {
			if (err) {
				logger.warn('File read error');
				throw err;
			}
			content = data;
		});

		return content;
	}
}
