import { Injectable, NestMiddleware } from '@nestjs/common';
import { Logger } from 'winston';
import jwt from 'jsonwebtoken';
import Exceptions from '@infra/errors/exceptions';
import LoggerGenerator from '@infra/logging/logger';
import { RequestInterface, ResponseInterface, NextFunctionInterface } from 'src/types/_endpointInterface';


@Injectable()
export default class JwtDecodeMiddleware implements NestMiddleware {
	private readonly logger: Logger;

	constructor(
		private readonly exceptions: Exceptions,
		private readonly loggerGenerator: LoggerGenerator,
	) {
		this.logger = this.loggerGenerator.getLogger();
	}

	public use(request: RequestInterface, response: ResponseInterface, next: NextFunctionInterface) {
		const authorization = request?.headers?.authorization;

		if (!authorization) {
			this.logger.warn('Request without authorization token');
			throw this.exceptions.unauthorized({
				message: 'Authorization token is required'
			});
		}

		const token = authorization.replace('Bearer ', '');
		const decoded = jwt.decode(token);
		if (!decoded) {
			this.logger.warn('Request with invalid authorization token');
			throw this.exceptions.unauthorized({
				message: 'Authorization token is invalid'
			});
		}

		let username = null, clientId = null;
		if (typeof (decoded) !== 'string') {
			username = decoded?.username || decoded['cognito:username'];
			clientId = decoded?.clientId || decoded?.client_id;
		}

		request.user = {
			username,
			clientId,
		};

		next();
	}
}
