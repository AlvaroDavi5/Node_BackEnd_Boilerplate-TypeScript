import { Injectable, Scope, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import LoggerService from '@core/logging/Logger.service';
import CryptographyService from '@core/security/Cryptography.service';
import { RequestInterface, ResponseInterface } from '@shared/interfaces/endpointInterface';


@Injectable({ scope: Scope.REQUEST })
export class LoggerInterceptor implements NestInterceptor {
	constructor(
		private readonly logger: LoggerService,
		private readonly cryptographyService: CryptographyService,
	) { }

	public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		this.logger.setContextName(LoggerInterceptor.name);
		const requestId = this.cryptographyService.generateUuid();
		this.logger.setRequestId(requestId);

		const request = context.switchToHttp().getRequest<RequestInterface>();
		const response = context.switchToHttp().getResponse<ResponseInterface>();

		return next.handle();
	}
}
