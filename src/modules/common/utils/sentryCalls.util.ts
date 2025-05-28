import {
	EventHint, SeverityLevel,
	captureException as captureSentryException, captureMessage as captureSentryMessage
} from '@sentry/nestjs';
import { LogLevelEnum } from '@core/logging/logger';
import { HttpStatusEnum } from '@common/enums/httpStatus.enum';
import externalErrorParser from '@common/utils/externalErrorParser.util';
import { ExceptionMetadataInterface } from '@shared/internal/interfaces/errorInterface';


function parseLogLevelToSentrySeverity(logLevel: LogLevelEnum): SeverityLevel {
	if (logLevel === LogLevelEnum.DEBUG)
		return 'debug';
	if (logLevel === LogLevelEnum.HTTP)
		return 'info';
	if (logLevel === LogLevelEnum.INFO)
		return 'info';
	if (logLevel === LogLevelEnum.WARN)
		return 'warning';
	if (logLevel === LogLevelEnum.ERROR)
		return 'error';

	return 'log';
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

export function captureLog(message: string, level: LogLevelEnum): void {
	captureSentryMessage(message, {
		level: parseLogLevelToSentrySeverity(level),
	});
}
