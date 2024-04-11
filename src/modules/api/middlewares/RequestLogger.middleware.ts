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
		const paramsKeys = Object.keys(request.params);
		const queryKeys = Object.keys(request.query);
		const bodyKeys = Object.keys(request.body);

		this.logger.info(`REQUESTED - [${method}] ${originalUrl} { "params": {${paramsKeys}} "query": {${queryKeys}} "body": {${bodyKeys}} }`);
		next();
	}
}
