import { Injectable, Inject, CanActivate, ExecutionContext } from '@nestjs/common';
import Exceptions from '@core/errors/Exceptions';
import { LoggerProviderInterface, SINGLETON_LOGGER_PROVIDER } from '@core/logging/Logger.service';
import { LoggerInterface } from '@core/logging/logger';
import CryptographyService from '@core/security/Cryptography.service';
import { RequestInterface } from '@shared/internal/interfaces/endpointInterface';


@Injectable()
export default class AuthGuard implements CanActivate {
	private readonly logger: LoggerInterface;

	constructor(
		private readonly cryptographyService: CryptographyService,
		private readonly exceptions: Exceptions,
		@Inject(SINGLETON_LOGGER_PROVIDER)
		private readonly loggerProvider: LoggerProviderInterface,
	) {
		this.logger = this.loggerProvider.getLogger(AuthGuard.name);
	}

	public canActivate(context: ExecutionContext): boolean {
		this.logger.verbose(`Running guard in '${context.getType()}' context`);

		const request = context.switchToHttp().getRequest<RequestInterface>();
		const authorization = request?.headers?.authorization;

		if (!authorization) {
			this.logger.warn('Request without authorization token');
			throw this.exceptions.unauthorized({
				message: 'Authorization token is required',
			});
		}

		const token = authorization.replace('Bearer ', '');
		const { content, invalidSignature, expired } = this.cryptographyService.decodeJwt(token);

		if (!content || typeof content === 'string') {
			if (expired) {
				this.logger.warn('Request with expired authorization token');
				throw this.exceptions.unauthorized({
					message: 'Authorization token was expired',
				});
			} else if (invalidSignature) {
				this.logger.warn('Request with invalid authorization token signature');
				throw this.exceptions.unauthorized({
					message: 'Authorization token has invalid signature',
				});
			}

			this.logger.warn(`Request with invalid authorization token content: ${content}`);
			throw this.exceptions.unauthorized({
				message: 'Authorization token is invalid',
			});
		}

		request.user = {
			username: content?.username ?? content['cognito:username'],
			clientId: content?.clientId ?? content?.client_id,
		};

		return true;
	}
}
