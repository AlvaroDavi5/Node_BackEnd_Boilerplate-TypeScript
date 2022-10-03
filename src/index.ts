/**
* @param {Object} ctx - container dependency injection
* @param {import('src/index')} ctx.aws
**/
import container from './container';


async function startApplication() {
	const app = container.resolve('application');

	app
		.start()
		.catch((error: Error) => {
			app.logger.error(error);
			process.exit();
		});
}


startApplication();
