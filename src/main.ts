import { NestFactory, SerializedGraph, PartialGraphHost } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { captureException as captureOnSentry } from '@sentry/nestjs';
import { writeFileSync } from 'fs';
import CoreModule from '@core/core.module';
import nestListenConfig, { createNestApplicationOptions, validateKnownExceptions } from '@core/configs/nestListen.config';
import nestApiConfig from '@core/configs/nestApi.config';
import swaggerDocConfig from '@core/configs/swaggerDoc.config';
import { ConfigsInterface } from '@core/configs/envs.config';
import { EnvironmentsEnum } from '@common/enums/environments.enum';
import { ProcessExitStatusEnum } from '@common/enums/processEvents.enum';
import { ErrorInterface } from '@shared/internal/interfaces/errorInterface';


async function startNestApplication() {
	const nestApp = await NestFactory.create(CoreModule, createNestApplicationOptions);
	nestListenConfig(nestApp);

	nestApiConfig(nestApp);
	swaggerDocConfig(nestApp);

	const appConfigs = nestApp.get<ConfigService>(ConfigService, {}).get<ConfigsInterface['application']>('application')!;

	if (appConfigs?.environment === EnvironmentsEnum.DEVELOPMENT)
		writeFileSync('./docs/nestGraph.json', nestApp.get(SerializedGraph).toString());

	await nestApp.listen(Number(appConfigs.appPort))
		.catch((error: ErrorInterface | Error) => { validateKnownExceptions(error); });
}

startNestApplication().catch((error: Error) => {
	// eslint-disable-next-line no-console
	console.error(error);
	captureOnSentry(error);
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
// !SECTION - ...
