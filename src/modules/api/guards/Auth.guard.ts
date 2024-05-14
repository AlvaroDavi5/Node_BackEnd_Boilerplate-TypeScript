import { Injectable, Inject, CanActivate, ExecutionContext } from '@nestjs/common';
import Exceptions from '@core/errors/Exceptions';
import { LOGGER_PROVIDER, LoggerProviderInterface } from '@core/logging/Logger.provider';
import { LoggerInterface } from '@core/logging/logger';
import CryptographyService from '@core/security/Cryptography.service';
import { RequestInterface } from '@shared/interfaces/endpointInterface';


@Injectable()
export default class AuthGuard implements CanActivate {
	private readonly logger: LoggerInterface;

	constructor(
		private readonly cryptographyService: CryptographyService,
		private readonly exceptions: Exceptions,
		@Inject(LOGGER_PROVIDER)
		private readonly loggerProvider: LoggerProviderInterface,
	) {
		this.logger = this.loggerProvider.getLogger(AuthGuard.name);
	}

	public canActivate(context: ExecutionContext): boolean {
		this.logger.debug(`Running guard in '${context.getType()}' context`);

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
