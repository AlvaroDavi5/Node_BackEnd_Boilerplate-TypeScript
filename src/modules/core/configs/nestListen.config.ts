import { INestApplication, NestApplicationOptions } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { init as initSentry, captureException as captureOnSentry, captureConsoleIntegration } from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { SINGLETON_LOGGER_PROVIDER, LoggerProviderInterface } from '@core/logging/Logger.service';
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

export default (nestApp: INestApplication): void => {
	nestApp.enableShutdownHooks();

	const logger = nestApp.get<LoggerProviderInterface>(SINGLETON_LOGGER_PROVIDER, { strict: false }).getLogger('NestApplication');
	const { environment } = nestApp.get<ConfigService>(ConfigService, { strict: false }).get<ConfigsInterface['application']>('application')!;

	process.on(ProcessEventsEnum.UNCAUGHT_EXCEPTION, async (error: Error, origin: string) => {
		logger.error(`App received ${ProcessEventsEnum.UNCAUGHT_EXCEPTION}`, `origin: ${origin}`, `error: ${error}`);
		await nestApp.close();
	});
	process.on(ProcessEventsEnum.UNHANDLED_REJECTION, async (reason: unknown, _promise: Promise<unknown>) => {
		logger.error(`App received ${ProcessEventsEnum.UNHANDLED_REJECTION}`, `reason: ${reason}`);
		await nestApp.close();
	});
	process.on(ProcessEventsEnum.MULTIPLE_RESOLVES, async (type: 'resolve' | 'reject', _promise: Promise<unknown>, value: unknown) => {
		logger.error(`App received ${ProcessEventsEnum.MULTIPLE_RESOLVES}`, `type: ${type}`, `value: ${value}`);
		await nestApp.close();
	});

	getObjValues<ProcessSignalsEnum>(ProcessSignalsEnum).map((procSignal) => process.on(procSignal, async (signal) => {
		logger.warn(`App received signal: ${signal}`);
		await nestApp.close();
	}));

	initSentry({
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
