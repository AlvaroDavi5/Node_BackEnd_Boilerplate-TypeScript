import { Injectable, Inject, NestMiddleware } from '@nestjs/common';
import { Logger } from 'winston';
import { LOGGER_PROVIDER, LoggerProviderInterface } from '@core/infra/logging/Logger.provider';
import { checkFields, replaceFields } from '@common/utils/objectRecursiveFunctions.util';
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

	private maskSensibleData(data: any) {
		const sensibleDataFields: string[] = ['password', 'newPassword', 'cvv', 'pin'];

		const hasSensibleData: boolean = checkFields(data, sensibleDataFields);
		if (hasSensibleData) {
			const newData = structuredClone(data);
			return replaceFields(newData, sensibleDataFields);
		}

		return data;
	}
}
