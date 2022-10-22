import fs from 'fs';
import { ContainerInterface } from 'src/types/_containerInterface';


/**
@param {Object} ctx - Dependency Injection (container)
@param {import('src/infra/logging/logger')} ctx.logger
**/
export default ({
	logger,
}: ContainerInterface) => ({
	read: (fileName: string) => {
		let content = '';

		fs.readFile(fileName, 'utf8', function (err, data) {
			if (err) {
				logger.error(err);
				throw err;
			}

			content = data;
		});

		return content;
	},
});
