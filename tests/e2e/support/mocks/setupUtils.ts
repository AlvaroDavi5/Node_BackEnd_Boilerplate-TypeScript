import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigsInterface } from '@core/configs/envs.config';
import nestListenConfig, { validateKnownExceptions } from '@core/configs/nestListen.config';
import nestApiConfig from '@core/configs/nestApi.config';
import { ErrorInterface } from '@shared/internal/interfaces/errorInterface';


export const createNestTestApplicationOptions = {
	abortOnError: true,
	snapshot: false,
	preview: false,
	forceCloseConnections: true,
};

export async function startNestApplication(nestApp: INestApplication): Promise<void> {
	await nestListenConfig(nestApp);

	nestApiConfig(nestApp);

	const { appPort } = nestApp.get<ConfigService>(ConfigService, {}).get<ConfigsInterface['application']>('application')!;

	await nestApp.listen(Number(appPort))
		.catch((error: ErrorInterface | Error) => {
			validateKnownExceptions(error);
		});
}
