import { Injectable, CanActivate, ExecutionContext, Scope } from '@nestjs/common';
import Exceptions from '@core/errors/Exceptions';
import LoggerService from '@core/logging/Logger.service';
import CryptographyService from '@core/security/Cryptography.service';
import { RequestInterface } from '@shared/internal/interfaces/endpointInterface';


@Injectable({ scope: Scope.DEFAULT })
export default class AuthGuard implements CanActivate {
	constructor(
		private readonly cryptographyService: CryptographyService,
		private readonly logger: LoggerService,
		private readonly exceptions: Exceptions,
	) { }

	public canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<RequestInterface>();
		const requestId = request?.id;
		const clientIp = request?.socket?.remoteAddress;
		const authorization = request?.headers?.authorization;

		if (requestId)
			this.logger.setRequestId(requestId);
		if (clientIp)
			this.logger.setClientIp(clientIp);

		this.logger.verbose(`Running guard in '${context.getType()}' context`);

		if (!authorization) {
			this.logger.warn('Request without authorization token');
			throw this.exceptions.invalidToken({
				message: 'Authorization token is required',
			});
		}

		const token = authorization.replace('Bearer ', '');
		const { content, invalidSignature, expired } = this.cryptographyService.decodeJwt(token);

		if (!content || typeof content !== 'object') {
			if (expired) {
				this.logger.warn('Request with expired authorization token');
				throw this.exceptions.invalidToken({
					message: 'Authorization token was expired',
				});
			} else if (invalidSignature) {
				this.logger.warn('Request with invalid authorization token signature');
				throw this.exceptions.invalidToken({
					message: 'Authorization token has invalid signature',
				});
			}

			this.logger.warn(`Request with invalid authorization token content: ${content}`);
			throw this.exceptions.invalidToken({
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
