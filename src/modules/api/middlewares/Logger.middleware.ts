import { Injectable, NestMiddleware } from '@nestjs/common';
import { Logger } from 'winston';
import LoggerGenerator from '@infra/logging/LoggerGenerator.logger';
import { RequestInterface, ResponseInterface, NextFunctionInterface } from 'src/types/_endpointInterface';


@Injectable()
export default class LoggerMiddleware implements NestMiddleware {
	private readonly logger: Logger;

	constructor(
		private readonly loggerGenerator: LoggerGenerator,
	) {
		this.logger = this.loggerGenerator.getLogger();
	}

	public use(request: RequestInterface, response: ResponseInterface, next: NextFunctionInterface) {
		const method = request.method;
		const statusCode = request.statusCode;
		const originalUrl = request.originalUrl;
		const paramsKeys = Object.keys(request.params);
		const queryKeys = Object.keys(request.query);
		const bodyKeys = Object.keys(request.body);

		this.logger.info(`REQUESTED - [${method}]:{${statusCode}} ${originalUrl} { "params": {${paramsKeys}} "query": {${queryKeys}} "body": {${bodyKeys}} }`);
		next();
	}
}
