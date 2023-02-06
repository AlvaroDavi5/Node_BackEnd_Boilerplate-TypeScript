import fs from 'fs';
import { ContainerInterface } from 'src/container';


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
