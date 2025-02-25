import { SeverityLevel } from '@sentry/nestjs';
import { LogLevelEnum } from '@core/logging/logger';
import { HttpStatusEnum } from '@common/enums/httpStatus.enum';


export function parseLogLevelToSentrySeverity(logLevel: LogLevelEnum): SeverityLevel {
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

export function parseExceptionStatusCodeToSentrySeverity(statusCode: number): SeverityLevel {
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
