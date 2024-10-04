import { Injectable, Inject, Scope, NestMiddleware } from '@nestjs/common';
import LoggerService, { REQUEST_LOGGER_PROVIDER } from '@core/logging/Logger.service';
import CryptographyService from '@core/security/Cryptography.service';
import { checkFieldsExistence, replaceFields } from '@common/utils/objectRecursiveFunctions.util';
import { RequestInterface, ResponseInterface, NextFunctionInterface } from '@shared/internal/interfaces/endpointInterface';


@Injectable({ scope: Scope.DEFAULT })
export default class RequestLoggerMiddleware implements NestMiddleware {
	constructor(
		@Inject(REQUEST_LOGGER_PROVIDER)
		private readonly logger: LoggerService,
		private readonly cryptographyService: CryptographyService,
	) { }

	public use(request: RequestInterface, _response: ResponseInterface, next: NextFunctionInterface) {
		const requestId = this.cryptographyService.generateUuid();
		this.logger.setRequestId(requestId);
		request.id = requestId;

		const { method, originalUrl } = request;
		const pathParams = JSON.stringify(this.maskSensitiveData(request.params));
		const queryParams = JSON.stringify(this.maskSensitiveData(request.query));
		const body = JSON.stringify(this.maskSensitiveData(request.body));

		this.logger.http(`REQUESTED - [${method}] ${originalUrl} { path: ${pathParams}, query: ${queryParams}, body: ${body} }`);

		next();
	}

	private maskSensitiveData(data: object) {
		const sensitiveDataFields: string[] = ['password', 'newPassword', 'cvv', 'pin'];

		const hasSensitiveData: boolean = checkFieldsExistence(data, sensitiveDataFields as (keyof object)[]);
		if (hasSensitiveData) {
			const newData = structuredClone(data);
			return replaceFields(newData, sensitiveDataFields as (keyof object)[], '***');
		}

		return data;
	}
}
