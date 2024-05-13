import { NestFactory, SerializedGraph, PartialGraphHost } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { json, urlencoded } from 'express';
import { writeFileSync } from 'fs';
import compression from 'compression';
import CoreModule from '@core/core.module';
import { ProcessEventsEnum, ProcessSignalsEnum, ProcessExitStatusEnum } from '@common/enums/processEvents.enum';
import { ExceptionsEnum } from '@common/enums/exceptions.enum';
import { HttpMethodsEnum } from '@common/enums/httpMethods.enum';
import { EnvironmentsEnum } from '@common/enums/environments.enum';
import { LOGGER_PROVIDER, LoggerProviderInterface } from '@core/logging/Logger.provider';
import swaggerSetupConfig from '@core/configs/swaggerSetup.config';
import { ConfigsInterface } from '@core/configs/configs.config';
import { ErrorInterface } from '@shared/interfaces/errorInterface';


async function startNestApplication() {
	const nestApp = await NestFactory.create(CoreModule, {
		abortOnError: false,
		snapshot: true,
		preview: false,
		forceCloseConnections: true,
		/*
		httpsOptions: {
			key: '',
			cert: '',
		},
		*/
	});
	nestApp.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
			forbidNonWhitelisted: true,
			disableErrorMessages: false,
		}),
	);
	nestApp.enableShutdownHooks();

	nestApp.setGlobalPrefix('api');
	nestApp.enableVersioning({
		type: VersioningType.URI,
		defaultVersion: '',
		prefix: '',
	});
	nestApp.use(json({ limit: '10mb' }));
	nestApp.use(urlencoded({ extended: true }));
	nestApp.use(compression());
	nestApp.enableCors({
		origin: '*',
		allowedHeaders: '*',
		methods: Object.values(HttpMethodsEnum),
	});
	nestApp.useWebSocketAdapter(new IoAdapter(nestApp)); // WsAdapter

	swaggerSetupConfig(nestApp);

	const logger = nestApp.get<LoggerProviderInterface>(LOGGER_PROVIDER, {}).getLogger('NestApplication');
	const appConfigs = nestApp.get<ConfigService>(ConfigService, {}).get<ConfigsInterface['application']>('application')!;

	if (appConfigs?.environment === EnvironmentsEnum.DEVELOPMENT)
		writeFileSync('./docs/nestGraph.json', nestApp.get(SerializedGraph).toString());

	await nestApp.listen(Number(appConfigs.appPort)).catch((error: ErrorInterface | Error) => {
		const knownExceptions = Object.values(ExceptionsEnum).map((exception) => exception.toString());

		if (error?.name && !knownExceptions.includes(error.name)) {
			const newError = new Error(error.message);
			newError.name = error.name;
			newError.stack = error.stack;

			throw newError;
		}
	});

	process.on(ProcessEventsEnum.UNCAUGHT_EXCEPTION, async (error: Error, origin: string) => {
		logger.error(`App received ${origin}: \nerror: ${error}`);
		await nestApp.close();
	});
	process.on(ProcessEventsEnum.UNHANDLED_REJECTION, async (reason: unknown, promise: Promise<unknown>) => {
		logger.error(`App received ${ProcessEventsEnum.UNHANDLED_REJECTION}: \nreason: ${reason} \npromise: ${promise}`);
		await nestApp.close();
	});
	process.on(ProcessEventsEnum.MULTIPLE_RESOLVES, async (type: 'resolve' | 'reject', promise: Promise<unknown>, value: unknown) => {
		logger.error(`App received ${ProcessEventsEnum.MULTIPLE_RESOLVES}: \ntype: ${type} \nvalue: ${value} \npromise: ${promise}`);
		await nestApp.close();
	});

	Object.values(ProcessSignalsEnum).map((signal) => process.on(signal, async (signal) => {
		logger.warn(`App received signal: ${signal}`);
		await nestApp.close();
	}));
}

startNestApplication().catch((error: Error) => {
	console.error(error);
	if (process.env.NODE_ENV === EnvironmentsEnum.DEVELOPMENT)
		writeFileSync('./docs/nestGraph.json', PartialGraphHost.toString() ?? '');
	process.exit(ProcessExitStatusEnum.FAILURE);
});

// Better Comments:
// normal
// // hidden
// * document
// ? topic
// ! alert
// todo
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
