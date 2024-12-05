import { Injectable, Inject, Scope, NestMiddleware } from '@nestjs/common';
import CryptographyService from '@core/security/Cryptography.service';
import LoggerService, { REQUEST_LOGGER_PROVIDER } from '@core/logging/Logger.service';
import { cloneObject, checkFieldsExistence, replaceFields } from '@common/utils/objectRecursiveFunctions.util';
import { RequestInterface, ResponseInterface, NextFunctionInterface } from '@shared/internal/interfaces/endpointInterface';
import { TimeZonesEnum } from '@common/enums/timeZones.enum';
import { getDateTimeNow, fromDateTimeToEpoch } from '@common/utils/dates.util';


@Injectable({ scope: Scope.REQUEST })
export default class RequestMiddleware implements NestMiddleware {
	constructor(
		private readonly cryptographyService: CryptographyService,
		@Inject(REQUEST_LOGGER_PROVIDER) private readonly logger: LoggerService,
	) { }

	public use(request: RequestInterface, _response: ResponseInterface, next: NextFunctionInterface) {
		const requestDateMs = fromDateTimeToEpoch(getDateTimeNow(TimeZonesEnum.America_SaoPaulo), true, true);
		const requestId = request?.id ?? this.cryptographyService.generateUuid();
		const clientIp = request?.socket?.remoteAddress;

		if (clientIp)
			this.logger.setClientIp(clientIp);
		this.logger.setRequestId(requestId);
		request.id = requestId;
		request.createdAt = requestDateMs;

		const { method, originalUrl } = request;
		const pathParams = JSON.stringify(this.maskSensitiveData(request?.params));
		const queryParams = JSON.stringify(this.maskSensitiveData(request?.query));
		const body = JSON.stringify(this.maskSensitiveData(request?.body));

		this.logger.http(`REQUESTED - [${method}] ${originalUrl} { path: ${pathParams}, query: ${queryParams}, body: ${body} }`);

		next();
	}

	private maskSensitiveData(data: object = {}) {
		const sensitiveDataFields: string[] = ['password', 'newPassword', 'cvv', 'pin'];

		const hasSensitiveData: boolean = checkFieldsExistence(data, sensitiveDataFields as (keyof object)[]);
		if (hasSensitiveData) {
			const newData = cloneObject(data);
			return replaceFields(newData, sensitiveDataFields as (keyof object)[], '***');
		}

		return data;
	}
}
