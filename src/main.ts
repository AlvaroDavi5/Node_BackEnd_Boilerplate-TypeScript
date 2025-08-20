import 'src/modules/core/errors/setup';
import { writeFileSync } from 'fs';
import { NestFactory, SerializedGraph, PartialGraphHost } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import CoreModule from '@core/core.module';
import nestListenConfig, { createNestApplicationOptions, validateKnownExceptions } from '@core/configs/nestListen.config';
import nestApiConfig from '@core/configs/nestApi.config';
import swaggerDocConfig from '@core/configs/swaggerDoc.config';
import { ConfigsInterface } from '@core/configs/envs.config';
import { EnvironmentsEnum } from '@common/enums/environments.enum';
import { ProcessExitStatusEnum } from '@common/enums/processEvents.enum';
import { ErrorInterface } from '@shared/internal/interfaces/errorInterface';
import type { Express } from 'express';


async function startNestApplication(): Promise<void> {
	const nestApp = await NestFactory.create<INestApplication<Express>>(CoreModule, createNestApplicationOptions);
	await nestListenConfig(nestApp);

	nestApiConfig(nestApp);

	const { environment, appPort } = nestApp.get<ConfigService>(ConfigService, {}).get<ConfigsInterface['application']>('application')!;

	if (environment !== EnvironmentsEnum.PRODUCTION)
		swaggerDocConfig(nestApp);

	if (environment === EnvironmentsEnum.DEVELOPMENT)
		writeFileSync('./docs/nestGraph.json', nestApp.get(SerializedGraph, {}).toString());

	await nestApp.listen(appPort)
		.catch((error: ErrorInterface | Error) => {
			validateKnownExceptions(error);
		});
}

startNestApplication().catch((error: Error) => {
	// eslint-disable-next-line no-console
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
// !SECTION - ...
