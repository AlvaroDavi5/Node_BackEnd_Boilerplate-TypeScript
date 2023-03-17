import container from './container';
import exceptionsEnum from 'src/domain/enums/exceptionsEnum';
import Application from 'src/app/Application';


async function startApplication() {
	const app: Application = container.resolve('application');

	app
		.start()
		.catch((error: any) => {
			app.logger.error(error);
		});

	process.on('uncaughtException', function (error: Error) {
		const knowExceptions = exceptionsEnum.values();

		function toCamelCase(str: string) {
			return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word: string, index: number) {
				return index === 0 ? word.toLowerCase() : word.toUpperCase();
			}).replace(/\s+/g, '');
		}

		if (!knowExceptions?.includes(toCamelCase(error.name))) {
			console.error('\n', error, '\n');
			process.exit();
		}
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
