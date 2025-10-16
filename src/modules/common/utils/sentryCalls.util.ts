import {
	SeverityLevel, logger as sentryLogger,
	captureException as captureSentryException, captureMessage as captureSentryMessage
} from '@sentry/nestjs';
import externalErrorParser from '@common/utils/externalErrorParser.util';
import { HttpStatusEnum } from '@common/enums/httpStatus.enum';
import { LogLevelEnum } from '@common/enums/logLevel.enum';
import { ExceptionMetadataInterface } from '@shared/internal/interfaces/errorInterface';


function parseLogLevelToSentrySeverity(logLevel: LogLevelEnum): SeverityLevel {
	if (logLevel === LogLevelEnum.WARN) {
		return 'warning';
	}
	if (logLevel === LogLevelEnum.HTTP) {
		return 'info';
	}
	if (logLevel === LogLevelEnum.VERBOSE || !Object.values(LogLevelEnum).includes(logLevel)) {
		return 'log';
	}

	return logLevel;
}

function parseExceptionStatusCodeToSentrySeverity(statusCode: number): SeverityLevel {
	if (statusCode < HttpStatusEnum.OK)
		return 'debug';
	if (statusCode < HttpStatusEnum.MULTIPLE_CHOICES)
		return 'info';
	if (statusCode < HttpStatusEnum.BAD_REQUEST)
		return 'log';
	if (statusCode < HttpStatusEnum.INTERNAL_SERVER_ERROR)
		return 'warning';
	if (statusCode === HttpStatusEnum.SERVICE_UNAVAILABLE || statusCode === HttpStatusEnum.GATEWAY_TIMEOUT)
		return 'fatal';

	return 'error';
}

export function captureException(error: unknown, metadata?: ExceptionMetadataInterface): void {
	const errorStatus = externalErrorParser(error).getStatus();

	captureSentryException(error, {
		level: parseExceptionStatusCodeToSentrySeverity(errorStatus),
		data: metadata?.data,
		user: metadata?.user,
	});
}

export function captureMessage(message: string, level: LogLevelEnum): void {
	captureSentryMessage(message, {
		level: parseLogLevelToSentrySeverity(level),
	});
}

export function captureLog(message: string, level: LogLevelEnum): void {
	const sentryLevel = parseLogLevelToSentrySeverity(level);

	switch (sentryLevel) {
		case 'debug':
			sentryLogger.debug(message);
			break;
		case 'info':
			sentryLogger.info(message);
			break;
		case 'warning':
			sentryLogger.warn(message);
			break;
		case 'error':
			sentryLogger.error(message);
			break;
		case 'fatal':
			sentryLogger.fatal(message);
			break;
		default:
			sentryLogger.trace(message);
			break;
	}
}
