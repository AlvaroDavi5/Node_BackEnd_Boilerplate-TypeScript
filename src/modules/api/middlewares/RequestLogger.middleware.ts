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

		const { method, originalUrl } = request;
		const pathParams = JSON.stringify(this.maskSensibleData(request.params));
		const queryParams = JSON.stringify(this.maskSensibleData(request.query));
		const body = JSON.stringify(this.maskSensibleData(request.body));

		const requestPayload = { pathParams, queryParams, body };
		this.logger.http(`REQUESTED - [${method}] ${originalUrl} ${JSON.stringify(requestPayload)}`);

		next();
	}

	private maskSensibleData(data: object) {
		const sensibleDataFields: string[] = ['password', 'newPassword', 'cvv', 'pin'];

		const hasSensibleData: boolean = checkFields(data, sensibleDataFields as keyof object);
		if (hasSensibleData) {
			const newData = structuredClone(data);
			return replaceFields(newData, sensibleDataFields as keyof object, '***');
		}

		return data;
	}
}
