/**
 @param {Object} ctx - Dependency Injection (container)
**/
import fs from 'fs';
import { containerInterface } from 'src/types/_containerInterface';


export default ({ logger }: containerInterface) => ({
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
