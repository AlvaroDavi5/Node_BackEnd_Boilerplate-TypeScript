import {
	init as initSentry, consoleIntegration, captureConsoleIntegration,
	captureException as captureSentryException, captureMessage as captureSentryMessage
} from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { GraphQLFormattedError } from 'graphql';
import envsConfig from '@core/configs/envs.config';
import externalErrorParser from '@common/utils/externalErrorParser.util';
import readPackageInfo from '@common/utils/packageInfoReader.util';
import { parseExceptionStatusCodeToSentrySeverity, parseLogLevelToSentrySeverity } from '@common/utils/sentrySeverity.util';
import { EnvironmentsEnum } from '@common/enums/environments.enum';
import { LogLevelEnum } from '@core/logging/logger';
import { ExceptionMetadataInterface } from '@shared/internal/interfaces/errorInterface';

export function captureException(error: unknown, metadata?: ExceptionMetadataInterface): void {
	const errorStatus = externalErrorParser(error).getStatus();

	captureSentryException(error, {
		level: parseExceptionStatusCodeToSentrySeverity(errorStatus),
		data: metadata?.data as undefined,
		user: metadata?.user,
	});
}

export function captureLog(message: string, level: LogLevelEnum): void {
	captureSentryMessage(message, {
		level: parseLogLevelToSentrySeverity(level),
	});
}

export function configureTrackers(
	{ environment, sentryDsn }: {
		environment: string,
		sentryDsn?: string,
	}): void {
	const { name: packageName, version: packageVersion } = readPackageInfo();
	const { application: { showExternalLogs } } = envsConfig();

	initSentry({
		dsn: sentryDsn,
		enabled: environment === EnvironmentsEnum.PRODUCTION,
		environment,
		integrations: [
			nodeProfilingIntegration(),
			consoleIntegration(),
			captureConsoleIntegration(),
		],
		profilesSampleRate: 1.0,
		tracesSampleRate: 1.0,
		sendDefaultPii: true,
		release: `${packageName}@${packageVersion}`,
		debug: showExternalLogs,
	});
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatGraphQlError({ message, extensions, path }: GraphQLFormattedError, error: any): GraphQLFormattedError {
	const graphQLFormattedError: GraphQLFormattedError = {
		message: message ?? error?.message,
		path: path ?? error?.path,
		extensions: {
			code: extensions?.code,
			originalError: extensions?.originalError,
		},
	};

	return graphQLFormattedError;
}
