import { INestApplication, NestApplicationOptions } from '@nestjs/common';
import { SINGLETON_LOGGER_PROVIDER, LoggerProviderInterface } from '@core/logging/Logger.service';
import { ProcessEventsEnum, ProcessSignalsEnum } from '@common/enums/processEvents.enum';
import { ExceptionsEnum } from '@common/enums/exceptions.enum';
import { getObjValues } from '@common/utils/dataValidations.util';
import { ErrorInterface } from '@shared/internal/interfaces/errorInterface';


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

	const logger = nestApp.get<LoggerProviderInterface>(SINGLETON_LOGGER_PROVIDER, {}).getLogger('NestApplication');

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

	getObjValues<ProcessSignalsEnum>(ProcessSignalsEnum).map((procSignal) => process.on(procSignal, async (signal) => {
		logger.warn(`App received signal: ${signal}`);
		await nestApp.close();
	}));
};

export function validateKnownExceptions(error: ErrorInterface | Error) {
	const knownExceptions = getObjValues<ExceptionsEnum>(ExceptionsEnum).map((exception) => exception.toString());

	if (error?.name && !knownExceptions.includes(error.name)) {
		const newError = new Error(error.message);
		newError.name = error.name;
		newError.stack = error.stack;

		throw newError;
	}
}
