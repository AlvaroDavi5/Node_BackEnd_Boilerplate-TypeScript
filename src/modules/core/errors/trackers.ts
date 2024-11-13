import {
	init as initSentry, captureException as captureOnSentry,
	consoleIntegration, captureConsoleIntegration,
} from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { GraphQLFormattedError } from 'graphql';
import readPackageInfo from '@common/utils/packageInfoReader.util';
import { EnvironmentsEnum } from '@common/enums/environments.enum';


export const captureError = (error: unknown): void => {
	captureOnSentry(error);
};

export const configureTrackers = (
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
			consoleIntegration(),
			captureConsoleIntegration(),
		],
		profilesSampleRate: 1.0,
		tracesSampleRate: 1.0,
		sendDefaultPii: true,
		debug: environment === EnvironmentsEnum.HOMOLOG,
		release: `${packageName}@${packageVersion}`,
	});
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatGraphQlError = ({ message, extensions, path }: GraphQLFormattedError, error: any): GraphQLFormattedError => {
	const graphQLFormattedError: GraphQLFormattedError = {
		message: message ?? error?.message,
		path: path ?? error?.path,
		extensions: {
			code: extensions?.code,
			originalError: extensions?.originalError,
		},
	};

	return graphQLFormattedError;
};
