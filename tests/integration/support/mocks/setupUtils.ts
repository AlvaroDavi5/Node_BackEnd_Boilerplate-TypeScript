import { INestApplication } from '@nestjs/common';
import dotenv from 'dotenv';
import nestApiConfig from '@core/configs/nestApi.config';
import { validateKnownExceptions } from '@core/configs/nestListen.config';
import { ProcessEventsEnum } from '@common/enums/processEvents.enum';
import { ErrorInterface } from '@shared/internal/interfaces/errorInterface';


export const createNestTestApplicationOptions = {
	abortOnError: true,
	snapshot: false,
	preview: false,
	forceCloseConnections: true,
};

export async function startNestApplication(nestApp: INestApplication) {
	dotenv.config({ path: '.env.test' });

	nestApp.enableShutdownHooks();

	process.on(ProcessEventsEnum.UNCAUGHT_EXCEPTION, async (error: Error, origin: string) => {
		console.error(`App received ${origin}: \nerror: ${error}`);
		await nestApp.close();
	});
	process.on(ProcessEventsEnum.UNHANDLED_REJECTION, async (reason: unknown, promise: Promise<unknown>) => {
		console.error(`App received ${ProcessEventsEnum.UNHANDLED_REJECTION}: \nreason: ${reason} \npromise: ${promise}`);
		await nestApp.close();
	});
	process.on(ProcessEventsEnum.MULTIPLE_RESOLVES, async (type: 'resolve' | 'reject', promise: Promise<unknown>, value: unknown) => {
		console.error(`App received ${ProcessEventsEnum.MULTIPLE_RESOLVES}: \ntype: ${type} \nvalue: ${value} \npromise: ${promise}`);
		await nestApp.close();
	});

	nestApiConfig(nestApp);

	await nestApp.listen(parseInt(process.env.APP_PORT ?? '3000', 10))
		.catch((error: ErrorInterface | Error) => { validateKnownExceptions(error); });
}
