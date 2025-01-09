import { Injectable, Scope, NestInterceptor, CallHandler, ExecutionContext } from '@nestjs/common';
import { Observable, tap, catchError } from 'rxjs';
import LoggerService from '@core/logging/Logger.service';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import { TimeZonesEnum } from '@common/enums/timeZones.enum';
import { fromDateTimeToEpoch, getDateTimeNow } from '@common/utils/dates.util';
import { isNullOrUndefined } from '@common/utils/dataValidations.util';
import { RequestInterface, ResponseInterface } from '@shared/internal/interfaces/endpointInterface';


@Injectable({ scope: Scope.DEFAULT })
export default class ResponseInterceptor implements NestInterceptor {
	constructor(
		private readonly logger: LoggerService,
		private readonly dataParserHelper: DataParserHelper,
	) { }

	public intercept(context: ExecutionContext, next: CallHandler<unknown>): Observable<unknown> | Promise<Observable<unknown>> {
		const httpContext = context.switchToHttp();
		const request = httpContext.getRequest<RequestInterface>();
		const response = httpContext.getResponse<ResponseInterface>();

		const requestId = request?.id;
		const clientIp = request?.socket?.remoteAddress;

		if (requestId) {
			this.logger.setRequestId(requestId);
			response.setHeader('REQ_ID', requestId);
		}
		if (clientIp)
			this.logger.setClientIp(clientIp);

		const { method, originalUrl } = request;
		const responseDateMs = fromDateTimeToEpoch(getDateTimeNow(TimeZonesEnum.America_SaoPaulo), true, true);
		const timestamp = !isNullOrUndefined(request.createdAt)
			? Math.abs(responseDateMs - request.createdAt!)
			: 999999;

		return next
			.handle()
			.pipe(
				tap((responseData: unknown): void => {
					const resData = this.dataParserHelper.toString(responseData);
					this.logger.http(`RESPONDING - ${timestamp} ms: [${method.toUpperCase()}] '${originalUrl}' ${resData}`);
				}),
				catchError((responseError: Error): Observable<void> => {
					const resErr = this.dataParserHelper.toString(responseError);
					this.logger.http(`RESPONDING ERROR - ${timestamp} ms: [${method.toUpperCase()}] '${originalUrl}' ${resErr}`);
					throw responseError;
				})
			);
	}
}
