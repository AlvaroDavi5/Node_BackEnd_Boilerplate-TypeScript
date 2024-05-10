import { Injectable, Inject, NestMiddleware } from '@nestjs/common';
import { Logger } from 'winston';
import { LOGGER_PROVIDER, LoggerProviderInterface } from '@core/infra/logging/Logger.provider';
import { RequestInterface, ResponseInterface, NextFunctionInterface } from '@shared/interfaces/endpointInterface';


@Injectable()
export default class RequestLoggerMiddleware implements NestMiddleware {
	private readonly logger: Logger;

	constructor(
		@Inject(LOGGER_PROVIDER)
		private readonly loggerProvider: LoggerProviderInterface,
	) {
		this.logger = this.loggerProvider.getLogger(RequestLoggerMiddleware.name);
	}

	public use(request: RequestInterface, response: ResponseInterface, next: NextFunctionInterface) {
		const method = request.method;
		const originalUrl = request.originalUrl;
		const pathParamsPayload = JSON.stringify(this.maskSensibleData(request.params));
		const queryParamsPayload = JSON.stringify(this.maskSensibleData(request.query));
		const bodyPayload = JSON.stringify(this.maskSensibleData(request.body));

		this.logger.info(`REQUESTED - [${method}] ${originalUrl} { "pathParams": ${pathParamsPayload} "queryParams": ${queryParamsPayload} "body": ${bodyPayload} }`);
		next();
	}

	private maskSensibleData(payload: any) {
		const sensibleDataFields: string[] = ['password', 'newPassword', 'cvv'];

		const payloadKeys = Object.keys(payload);
		if (payloadKeys.some((key: string) => sensibleDataFields.includes(key))) {
			const newPayload = structuredClone(payload);

			sensibleDataFields.forEach((key: string) => {
				if (newPayload[key] !== undefined) {
					newPayload[key] = '***';
				}
			});

			return newPayload;
		}

		return payload;
	}
}
