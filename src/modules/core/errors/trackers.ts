import { init as initSentry, captureException as captureOnSentry, captureConsoleIntegration } from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { EnvironmentsEnum } from '@common/enums/environments.enum';


export const captureError = (error: unknown): void => {
	captureOnSentry(error);
};

export const configureTrackers = (
	environment: string,
	{ sentryDsn }: { sentryDsn?: string }
): void => {
	initSentry({
		enabled: environment === EnvironmentsEnum.PRODUCTION,
		environment,
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
