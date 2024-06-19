import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import dotenv from 'dotenv';
import { ConfigsInterface } from '@core/configs/configs.config';
import nestListenConfig, { validateKnownExceptions } from '@core/configs/nestListen.config';
import nestApiConfig from '@core/configs/nestApi.config';
import swaggerDocConfig from '@core/configs/swaggerDoc.config';
import { ErrorInterface } from '@shared/internal/interfaces/errorInterface';


export const createNestTestApplicationOptions = {
	abortOnError: true,
	snapshot: false,
	preview: false,
	forceCloseConnections: true,
};

export async function startNestApplication(nestApp: INestApplication) {
	dotenv.config({ path: '.env.test' });

	nestListenConfig(nestApp);

	nestApiConfig(nestApp);
	swaggerDocConfig(nestApp);

	const appConfigs = nestApp.get<ConfigService>(ConfigService, {}).get<ConfigsInterface['application']>('application')!;

	await nestApp.listen(Number(appConfigs.appPort))
		.catch((error: ErrorInterface | Error) => { validateKnownExceptions(error); });
}
