import { INestApplication } from '@nestjs/common';
import { validateKnownExceptions } from '@core/configs/nestListen.config';
import nestApiConfig from '@core/configs/nestApi.config';
import { ProcessEventsEnum } from '@common/enums/processEvents.enum';
import { ErrorInterface } from '@shared/internal/interfaces/errorInterface';


export const createNestTestApplicationOptions = {
	abortOnError: true,
	snapshot: false,
	preview: false,
	forceCloseConnections: true,
};

export async function startNestApplication(nestApp: INestApplication) {
	nestApp.enableShutdownHooks();

	process.on(ProcessEventsEnum.UNCAUGHT_EXCEPTION, async (error: Error, origin: string) => {
		console.error(`App received ${ProcessEventsEnum.UNCAUGHT_EXCEPTION}`, `origin: ${origin}`, `error: ${error}`);
		await nestApp.close();
	});
	process.on(ProcessEventsEnum.UNHANDLED_REJECTION, async (reason: unknown, _promise: Promise<unknown>) => {
		console.error(`App received ${ProcessEventsEnum.UNHANDLED_REJECTION}`, `reason: ${reason}`);
		await nestApp.close();
	});

	nestApiConfig(nestApp);

	await nestApp.listen(parseInt(process.env.APP_PORT ?? '3000', 10))
		.catch((error: ErrorInterface | Error) => { validateKnownExceptions(error); });
}
