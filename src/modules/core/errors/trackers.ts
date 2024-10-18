import { INestApplication } from '@nestjs/common';
import { init as initSentry, captureException as captureOnSentry, captureConsoleIntegration, setupNestErrorHandler as setupSentryNestErrorHandler } from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { HttpExceptionsFilter } from '@api/filters/HttpExceptions.filter';
import readPackageInfo from '@common/utils/packageInfoReader.util';
import { EnvironmentsEnum } from '@common/enums/environments.enum';


export const captureError = (error: unknown): void => {
	captureOnSentry(error);
};

export const configureTrackers = (
	nestApp: INestApplication,
	httpExceptionsFilter: HttpExceptionsFilter,
	{ environment, sentryDsn }: {
		environment: string,
		sentryDsn?: string,
	}): void => {
	const { name: packageName, version: packageVersion } = readPackageInfo();

	initSentry({
		enabled: environment === EnvironmentsEnum.PRODUCTION,
		environment,
		dsn: sentryDsn,
		integrations: [
			nodeProfilingIntegration(),
			captureConsoleIntegration(),
		],
		profilesSampleRate: 1.0,
		tracesSampleRate: 1.0,
		sendDefaultPii: true,
		debug: environment === EnvironmentsEnum.HOMOLOG,
		release: `${packageName}@${packageVersion}`,
	});
	setupSentryNestErrorHandler(nestApp, httpExceptionsFilter);
};
