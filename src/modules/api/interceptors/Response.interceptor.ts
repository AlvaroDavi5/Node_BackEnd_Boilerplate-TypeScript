import { Injectable, Scope, NestInterceptor, CallHandler, ExecutionContext, StreamableFile } from '@nestjs/common';
import { Observable, tap, catchError } from 'rxjs';
import LoggerService from '@core/logging/Logger.service';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import { isNullOrUndefined, normalizeToArray } from '@common/utils/dataValidations.util';
import { fromDateTimeToEpoch, getDateTimeNow } from '@common/utils/dates.util';
import { TimeZonesEnum } from '@common/enums/timeZones.enum';
import { RequestInterface, ResponseInterface } from '@shared/internal/interfaces/endpointInterface';


@Injectable({ scope: Scope.REQUEST })
export default class ResponseInterceptor implements NestInterceptor {
	constructor(
		private readonly logger: LoggerService,
		private readonly dataParserHelper: DataParserHelper,
	) { }

	public intercept(context: ExecutionContext, next: CallHandler<unknown>): Observable<unknown> | Promise<Observable<unknown>> {
		const httpContext = context.switchToHttp();
		const request = httpContext.getRequest<RequestInterface>();
		const response = httpContext.getResponse<ResponseInterface>();

		const [headerRequestId] = normalizeToArray<string | undefined>(request?.headers['x-request-id']);
		const requestId = headerRequestId ?? request?.id;
		if (requestId) {
			this.logger.setRequestId(requestId);
			response.header('x-request-id', requestId);
		}

		const clientIp = request?.ip ?? request?.socket?.remoteAddress;
		if (clientIp)
			this.logger.setClientIp(clientIp);

		const { method } = request;
		const path = this.getRequestPath(request);
		const reqMethod = method.toUpperCase();

		const requestDateHeaders = request.headers['x-request-timestamp'];
		const [requestDateHeader] = normalizeToArray(requestDateHeaders);
		const requestDateMs = !!requestDateHeader ? parseInt(requestDateHeader, 10) : undefined;

		return next
			.handle()
			.pipe(
				tap((responseData: unknown): void => {
					const resData = this.parseResponseDataToString(responseData);
					const timestamp = this.getTimestamp(requestDateMs);
					this.logger.http(`RESPONDING - [${reqMethod}] ${path} (${timestamp} ms): ${resData}`);
				}),
				catchError((responseError: Error): Observable<void> => {
					const resErr = this.parseResponseDataToString(responseError);
					const timestamp = this.getTimestamp(requestDateMs);
					this.logger.http(`RESPONDING ERROR - [${reqMethod}] ${path} (${timestamp} ms): ${resErr}`);
					throw responseError;
				})
			);
	}

	private getRequestPath(request: RequestInterface): string {
		const { originalUrl, url, routeOptions } = request;
		const baseUrl = routeOptions?.url;
		const [originalUrlPath] = originalUrl.split('?');
		const [urlPath] = url.split('?');

		return baseUrl || originalUrlPath || urlPath;
	}

	private parseResponseDataToString(responseData: unknown): string {
		if (responseData instanceof StreamableFile) {
			return '[StreamableFile]';
		}
		if (responseData instanceof ArrayBuffer) {
			return '[ArrayBuffer]';
		}
		if (Buffer.isBuffer(responseData)) {
			return '[Buffer]';
		}

		return this.dataParserHelper.toString(responseData);
	}

	private getTimestamp(requestDateMs: number | undefined): string {
		const responseDateMs = fromDateTimeToEpoch(getDateTimeNow(TimeZonesEnum.America_SaoPaulo), 'milliseconds', true);
		const timestamp = !isNullOrUndefined(requestDateMs)
			? String(Math.abs(responseDateMs - requestDateMs))
			: 'UNDEFINED';

		return timestamp;
	}
}
