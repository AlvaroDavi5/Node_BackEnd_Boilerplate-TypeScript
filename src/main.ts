import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import ContainerModule from './container.module';
import exceptionsEnum from './domain/enums/exceptionsEnum';
import { ErrorInterface } from './types/_errorInterface';


async function startNestApplication() {
	const nestApp = await NestFactory.create(ContainerModule);

	const config = new DocumentBuilder()
		.setTitle('Node DDD Back-End Boilerplate')
		.setVersion('1.0.0')
		.build();
	const document = SwaggerModule.createDocument(nestApp, config);
	SwaggerModule.setup('/api/docs', nestApp, document, {
		customSiteTitle: 'Boilerplate API',
		swaggerOptions: {
			docExpansion: 'none',
		},
	});

	nestApp.setGlobalPrefix('api');
	nestApp.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	);

	const { port } = nestApp.get(ConfigService).get('application');
	await nestApp.listen(Number(port)).catch((error: ErrorInterface) => {
		const knowExceptions = exceptionsEnum.values();

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

startNestApplication();

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