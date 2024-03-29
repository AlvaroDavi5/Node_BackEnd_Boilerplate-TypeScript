import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Logger } from 'winston';
import Exceptions from '@core/infra/errors/Exceptions';
import LoggerGenerator from '@core/infra/logging/LoggerGenerator.logger';
import CryptographyService from '@core/infra/security/Cryptography.service';
import { RequestInterface } from '@shared/interfaces/endpointInterface';


@Injectable()
export default class AuthGuard implements CanActivate {
	private readonly logger: Logger;

	constructor(
		private readonly cryptographyService: CryptographyService,
		private readonly exceptions: Exceptions,
		private readonly loggerGenerator: LoggerGenerator,
	) {
		this.logger = this.loggerGenerator.getLogger();
	}

	public canActivate(context: ExecutionContext): boolean {
		this.logger.debug(`Running guard '${AuthGuard.name}' in '${context.getType()}' context`);

		const request = context.switchToHttp().getRequest<RequestInterface>();
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

		let username: string | null = null, clientId: string | null = null;
		if (typeof decoded !== 'string') {
			username = decoded?.username ?? decoded['cognito:username'];
			clientId = decoded?.clientId ?? decoded?.client_id;
		}

		request.user = {
			username,
			clientId,
		};

		return true;
	}
}
