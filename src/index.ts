/**
* @param {Object} ctx - container dependency injection
**/
import container from './container';
import { messageType } from 'src/types/_messageType';


async function startApplication() {
	const app = container.resolve('application');

	app
		.start()
		.catch((error: messageType) => {
			app.logger.error(error);
			process.exit();
		});
}


startApplication();
