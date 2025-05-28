import {
	init as initSentry, consoleIntegration, captureConsoleIntegration
} from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import envsConfig from '@core/configs/envs.config';
import { EnvironmentsEnum } from '@common/enums/environments.enum';


const {
	application: { environment, showExternalLogs, sentryDsn },
	package: { name: packageName, version: packageVersion },
} = envsConfig();

initSentry({
	dsn: sentryDsn,
	enabled: environment === EnvironmentsEnum.PRODUCTION,
	environment,
	integrations: [
		nodeProfilingIntegration(),
		captureConsoleIntegration(),
		consoleIntegration(),
	],
	profilesSampleRate: 0.1,
	tracesSampleRate: 0.1,
	tracePropagationTargets: [],
	sendDefaultPii: true,
	release: `${packageName}@${packageVersion}`,
	debug: showExternalLogs,
	beforeSend(event, _hint) {
		return event;
	},
	beforeSendTransaction(event, _hint) {
		return event;
	},
	beforeBreadcrumb(breadcrumb, _hint) {
		return breadcrumb;
	},
	_experiments: { enableLogs: true },
});

