import container from './container';
import exceptionsEnum from 'src/domain/enums/exceptionsEnum';
import Application from 'src/app/Application';
import { ErrorInterface } from 'src/types/_errorInterface';


async function startApplication() {
	const app: Application = container.resolve('application');

	app
		.start()
		.catch((error: ErrorInterface) => {
			const knowExceptions = exceptionsEnum.values();
			app.logger.error(error);

			if (!knowExceptions?.includes(String(error.errorType))) {
				const err = new Error(`${error.message}`);
				err.name = error.name || err.name;
				err.stack = error.stack;

				throw err;
			}
		});

	process.on('uncaughtException', function (error: Error) {
		console.error('\n', error, '\n');
		process.exit();
	});
}


startApplication();

// Better Comments:
// normal
// // hidden
// * document
// ? topic
// ! alert
// todo to do
/**
* @brief
* @param param
* @return
**/

// Comment Anchors:
// TODO - ...
// FIXME - ...
// ANCHOR - ...
// LINK - ...
// NOTE - ...
// REVIEW - ...
// SECTION - ...
// STUB - ...
