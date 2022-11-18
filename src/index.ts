import container from './container';
import { messageType } from 'src/types/_messageType';


/**
*@param {Object} ctx - container dependency injection
**/
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

// Better Comments:
// normal
// // hiden
// * document
// ? topic
// ! alert
// todo to do
/**
* @param param
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
