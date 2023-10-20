import { Injectable } from '@nestjs/common';
import fs from 'fs';
import { Logger } from 'winston';
import LoggerGenerator from '@core/infra/logging/LoggerGenerator.logger';


@Injectable()
export default class CacheAccessHelper {
	private readonly logger: Logger;

	constructor(
		private readonly loggerGenerator: LoggerGenerator,
	) {
		this.logger = this.loggerGenerator.getLogger();
	}

	public async read(filePath: string): Promise<string | null> {
		let content: string | null = null;

		const readPromise = new Promise<string>((resolve, reject) => {
			fs.readFile(filePath, { encoding: 'utf8' }, (error, data) => {
				if (error) {
					this.logger.warn('File read error:', error.message);
					reject(error);
				} else {
					resolve(data);
				}
			});
		});

		try {
			content = await readPromise;
		} catch (error) { }

		return content;
	}
}
