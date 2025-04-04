import {
	init as initSentry, consoleIntegration, captureConsoleIntegration
} from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import dotenv from 'dotenv';
import { EnvironmentsEnum } from '@common/enums/environments.enum';


dotenv.config();

const environment = process.env.NODE_ENV;
const packageName = process.env.npm_package_name;
const packageVersion = process.env.npm_package_version;
const sentryDsn = process.env.SENTRY_DSN;
const showExternalLogs = process.env.SHOW_EXTERNAL_LOGS === 'true';

initSentry({
	dsn: sentryDsn,
	enabled: environment === EnvironmentsEnum.PRODUCTION,
	environment,
	integrations: [
		nodeProfilingIntegration(),
		consoleIntegration(),
		captureConsoleIntegration(),
	],
	profilesSampleRate: 0.1,
	tracesSampleRate: 0.1,
	sendDefaultPii: true,
	release: `${packageName}@${packageVersion}`,
	debug: showExternalLogs,
	beforeSend(event) {
		return event;
	},
	beforeSendTransaction(event) {
		return event;
	},
});

