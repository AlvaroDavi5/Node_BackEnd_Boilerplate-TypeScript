import { Injectable, Inject, Scope, NestMiddleware } from '@nestjs/common';
import CryptographyService from '@core/security/Cryptography.service';
import LoggerService, { REQUEST_LOGGER_PROVIDER } from '@core/logging/Logger.service';
import { cloneObject, checkFieldsExistence, replaceFields } from '@common/utils/objectRecursiveFunctions.util';
import { getDateTimeNow, fromDateTimeToEpoch } from '@common/utils/dates.util';
import { TimeZonesEnum } from '@common/enums/timeZones.enum';
import { normalizeToArray } from '@common/utils/dataValidations.util';
import { RequestInterface, ResponseInterface, NextFunctionInterface } from '@shared/internal/interfaces/endpointInterface';


@Injectable({ scope: Scope.REQUEST })
export default class RequestMiddleware implements NestMiddleware {
	constructor(
		private readonly cryptographyService: CryptographyService,
		@Inject(REQUEST_LOGGER_PROVIDER) private readonly logger: LoggerService,
	) { }

	public use(request: RequestInterface, _response: ResponseInterface, next: NextFunctionInterface) {
		const requestDateMs = fromDateTimeToEpoch(getDateTimeNow(TimeZonesEnum.America_SaoPaulo), 'milliseconds', true);
		request.headers['x-request-timestamp'] = String(requestDateMs);

		const [headerRequestId] = normalizeToArray<string | undefined>(request?.headers['x-request-id']);
		const requestId = headerRequestId ?? request?.id ?? this.cryptographyService.generateUuid();
		if (requestId) {
			request.id = requestId;
			this.logger.setRequestId(requestId);
		}

		const clientIp = request?.ip ?? request?.socket?.remoteAddress;
		if (clientIp)
			this.logger.setClientIp(clientIp);

		const { method, params, query, body } = request;

		const pathParams = JSON.stringify(this.maskSensitiveData(params));
		const queryParams = JSON.stringify(this.maskSensitiveData(query));
		const reqBody = JSON.stringify(this.maskSensitiveData(body));

		const path = this.getRequestPath(request);
		const reqMethod = method.toUpperCase();

		this.logger.http(`REQUESTED - [${reqMethod}] ${path} { path: ${pathParams}, query: ${queryParams}, body: ${reqBody} }`);

		next();
	}

	private getRequestPath(request: RequestInterface): string {
		const { originalUrl, url, routeOptions } = request;
		const baseUrl = routeOptions?.url;
		const [originalUrlPath] = originalUrl.split('?');
		const [urlPath] = url.split('?');

		return baseUrl || originalUrlPath || urlPath;
	}

	private maskSensitiveData(data: unknown): unknown {
		const sensitiveDataFields: string[] = ['password', 'newPassword', 'cvv', 'pin'];

		if (typeof data === 'object' && data !== null) {
			const hasSensitiveData: boolean = checkFieldsExistence(data, sensitiveDataFields as (keyof object)[]);
			if (hasSensitiveData) {
				const newData = cloneObject(data);
				return replaceFields(newData, sensitiveDataFields as (keyof object)[], '***');
			}
		}

		return data;
	}
}
