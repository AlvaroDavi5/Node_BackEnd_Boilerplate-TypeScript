import { INestApplication, NestApplicationOptions } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { init as initSentry, captureException as captureOnSentry, captureConsoleIntegration } from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import LoggerService from '@core/logging/Logger.service';
import { LoggerInterface } from '@core/logging/logger';
import { ProcessEventsEnum, ProcessSignalsEnum } from '@common/enums/processEvents.enum';
import { ExceptionsEnum } from '@common/enums/exceptions.enum';
import { getObjValues } from '@common/utils/dataValidations.util';
import { ErrorInterface } from '@shared/internal/interfaces/errorInterface';
import { EnvironmentsEnum } from '@common/enums/environments.enum';
import { ConfigsInterface } from './envs.config';


export const createNestApplicationOptions: NestApplicationOptions = {
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
};

export default async (nestApp: INestApplication): Promise<void> => {
	nestApp.enableShutdownHooks();

	let logger: LoggerInterface | Console;
	await nestApp.resolve<LoggerService>(LoggerService)
		.then((loggerService) => {
			loggerService.setContextName('NestApplication');
			logger = loggerService;
		})
		.catch((err: unknown) => {
			// eslint-disable-next-line no-console
			console.error(err);
			logger = console;
		});

	const { environment, sentryDsn } = nestApp.get<ConfigService>(ConfigService, { strict: false }).get<ConfigsInterface['application']>('application')!;

	process.on(ProcessEventsEnum.UNCAUGHT_EXCEPTION, async (error: Error, origin: string) => {
		logger.error(`App received ${ProcessEventsEnum.UNCAUGHT_EXCEPTION}`, `origin: ${origin}`, `error: ${error}`);
		await nestApp.close();
	});
	process.on(ProcessEventsEnum.UNHANDLED_REJECTION, async (reason: unknown, _promise: Promise<unknown>) => {
		logger.error(`App received ${ProcessEventsEnum.UNHANDLED_REJECTION}`, `reason: ${reason}`);
		await nestApp.close();
	});
	getObjValues<ProcessSignalsEnum>(ProcessSignalsEnum).map((procSignal) => process.on(procSignal, async (signal) => {
		logger.warn(`App received signal: ${signal}`);
		await nestApp.close();
	}));

	initSentry({
		enabled: environment === EnvironmentsEnum.PRODUCTION,
		environment: environment,
		dsn: sentryDsn,
		integrations: [
			nodeProfilingIntegration(),
			captureConsoleIntegration(),
		],
		profilesSampleRate: 1.0,
		enableTracing: true,
		tracesSampleRate: 1.0,
		sendDefaultPii: true,
	});
};

export function validateKnownExceptions(error: ErrorInterface | Error): void {
	const knownExceptions = getObjValues<ExceptionsEnum>(ExceptionsEnum).map((exception) => exception.toString());

	if (error?.name && !knownExceptions.includes(error.name)) {
		const newError = new Error(error.message);
		newError.name = error.name;
		newError.stack = error.stack;

		captureOnSentry(newError);
		throw newError;
	}
}
