import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import CoreModule from '@core/core.module';
import { ProcessEventsEnum, ProcessSignalsEnum } from '@core/infra/start/processEvents.enum';
import { ExceptionsEnum } from '@core/infra/errors/exceptions.enum';
import { ConfigsInterface } from '@core/configs/configs.config';
import { ErrorInterface } from 'src/types/_errorInterface';


async function startNestApplication() {
	const nestApp = await NestFactory.create(CoreModule, {
		snapshot: true,
		preview: false,
	});
	nestApp.setGlobalPrefix('api');
	nestApp.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	);

	nestApp.enableShutdownHooks();

	nestApp.use(compression());
	nestApp.enableCors({
		origin: '*',
		allowedHeaders: '*',
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
	});
	nestApp.useWebSocketAdapter(new IoAdapter(nestApp)); // WsAdapter

	const config = new DocumentBuilder()
		.setTitle('Node Back-End Boilerplate')
		.setVersion('1.0.0')
		.setDescription('API Boilerplate created by Nest.js')
		.setContact('Álvaro Davi Santos Alves', 'https://github.com/AlvaroDavi5', 'alvaro.davisa@gmail.com')
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

	const appConfigs = nestApp.get<ConfigService>(ConfigService).get<ConfigsInterface['application'] | undefined>('application');
	await nestApp.listen(Number(appConfigs?.port)).catch((error: ErrorInterface) => {
		const knowExceptions = Object.values(ExceptionsEnum).map(exception => exception.toString());

		if (error?.name && !knowExceptions.includes(error?.name)) {
			const err = new Error(String(error.message));
			err.name = error.name || err.name;
			err.stack = error.stack;
			throw err;
		}
	});

	process.on(ProcessEventsEnum.UNCAUGHT_EXCEPTION, async (error, origin) => {
		console.error(`\nApp received ${origin}: ${error}\n`);
		await nestApp.close();
	});

	Object.values(ProcessSignalsEnum).map((signal) => process.on(signal, async (signal) => {
		console.error(`\nApp received signal: ${signal}\n`);
		await nestApp.close();
	}));
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
