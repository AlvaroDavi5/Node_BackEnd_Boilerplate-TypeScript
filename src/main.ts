import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import CoreModule from './core.module';
import { ExceptionsEnum } from '@infra/errors/exceptionsEnum';
import { ConfigsInterface } from '@configs/configs';
import { ErrorInterface } from 'src/types/_errorInterface';


async function startNestApplication() {
	console.log(`\n Started with PID ${process.pid} \n`);

	const nestApp = await NestFactory.create(CoreModule);
	nestApp.setGlobalPrefix('api');
	nestApp.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	);

	const config = new DocumentBuilder()
		.setTitle('Node Back-End Boilerplate')
		.setVersion('1.0.0')
		.addBearerAuth({
			type: 'http',
			scheme: 'bearer',
			in: 'header',
			bearerFormat: 'JWT',
			name: 'JWT',
			description: 'Enter JWT token',
		}, 'Authorization')
		.build();
	const document = SwaggerModule.createDocument(nestApp, config);
	SwaggerModule.setup('/api/docs', nestApp, document, {
		customSiteTitle: 'Boilerplate API',
		swaggerOptions: {
			docExpansion: 'none',
		},
	});

	const port: ConfigsInterface['application']['port'] = nestApp.get(ConfigService).get('application.port');
	await nestApp.listen(Number(port)).catch((error: ErrorInterface) => {
		const knowExceptions = Object.values(ExceptionsEnum).map(exception => exception.toString());

		if (error?.name && !knowExceptions.includes(error?.name)) {
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
@brief
@param param
@return
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
