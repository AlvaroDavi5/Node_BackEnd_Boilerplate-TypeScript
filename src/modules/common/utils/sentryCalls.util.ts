import {
	EventHint, SeverityLevel, logger as sentryLogger,
	captureException as captureSentryException, captureMessage as captureSentryMessage
} from '@sentry/nestjs';
import { LogLevelEnum } from '@core/logging/logger';
import { HttpStatusEnum } from '@common/enums/httpStatus.enum';
import externalErrorParser from '@common/utils/externalErrorParser.util';
import { ExceptionMetadataInterface } from '@shared/internal/interfaces/errorInterface';


function parseLogLevelToSentrySeverity(logLevel: LogLevelEnum): SeverityLevel {
	switch (logLevel) {
		case LogLevelEnum.DEBUG:
			return 'debug';
		case LogLevelEnum.HTTP:
			return 'info';
		case LogLevelEnum.INFO:
			return 'info';
		case LogLevelEnum.WARN:
			return 'warning';
		case LogLevelEnum.ERROR:
			return 'error';
		default:
			return 'log';
	}
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
		data: (metadata as EventHint)?.data,
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
