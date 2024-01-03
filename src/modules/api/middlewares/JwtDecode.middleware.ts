import { Injectable, NestMiddleware } from '@nestjs/common';
import { Logger } from 'winston';
import CryptographyService from '@core/infra/security/Cryptography.service';
import Exceptions from '@core/infra/errors/Exceptions';
import LoggerGenerator from '@core/infra/logging/LoggerGenerator.logger';
import { RequestInterface, ResponseInterface, NextFunctionInterface } from 'src/types/endpointInterface';
import { decodedFieldType } from 'src/types/userAuthInterface';


@Injectable()
export default class JwtDecodeMiddleware implements NestMiddleware {
	private readonly logger: Logger;

	constructor(
		private readonly cryptographyService: CryptographyService,
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
		const decoded = this.cryptographyService.decodeJwt(token);
		if (!decoded) {
			this.logger.warn('Request with invalid authorization token');
			throw this.exceptions.unauthorized({
				message: 'Authorization token is invalid'
			});
		}

		let username: decodedFieldType = null, clientId: decodedFieldType = null;
		if (typeof decoded !== 'string') {
			username = decoded?.username ?? decoded['cognito:username'];
			clientId = decoded?.clientId ?? decoded?.client_id;
		}

		request.user = {
			username,
			clientId,
		};

		next();
	}
}
