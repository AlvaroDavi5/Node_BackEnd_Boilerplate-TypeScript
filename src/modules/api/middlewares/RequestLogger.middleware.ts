import { Injectable, Inject, Scope, NestMiddleware } from '@nestjs/common';
import LoggerService, { REQUEST_LOGGER_PROVIDER } from '@core/logging/Logger.service';
import CryptographyService from '@core/security/Cryptography.service';
import { checkFields, replaceFields } from '@common/utils/objectRecursiveFunctions.util';
import { RequestInterface, ResponseInterface, NextFunctionInterface } from '@shared/internal/interfaces/endpointInterface';


@Injectable({ scope: Scope.DEFAULT })
export default class RequestLoggerMiddleware implements NestMiddleware {
	constructor(
		@Inject(REQUEST_LOGGER_PROVIDER)
		private readonly logger: LoggerService,
		private readonly cryptographyService: CryptographyService,
	) {
		this.logger.setContextName(RequestLoggerMiddleware.name);
	}

	public use(request: RequestInterface, response: ResponseInterface, next: NextFunctionInterface) {
		const requestId = this.cryptographyService.generateUuid();
		this.logger.setRequestId(requestId);
		request.id = requestId;

		const method = request.method;
		const originalUrl = request.originalUrl;
		const pathParamsPayload = JSON.stringify(this.maskSensibleData(request.params));
		const queryParamsPayload = JSON.stringify(this.maskSensibleData(request.query));
		const bodyPayload = JSON.stringify(this.maskSensibleData(request.body));

		this.logger.http(`REQUESTED - [${method}] ${originalUrl} { "pathParams": ${pathParamsPayload} "queryParams": ${queryParamsPayload} "body": ${bodyPayload} }`);

		next();
	}

	private maskSensibleData(data: any) {
		const sensibleDataFields: string[] = ['password', 'newPassword', 'cvv', 'pin'];

		const hasSensibleData: boolean = checkFields(data, sensibleDataFields);
		if (hasSensibleData) {
			const newData = structuredClone(data);
			return replaceFields(newData, sensibleDataFields, '***');
		}

		return data;
	}
}
