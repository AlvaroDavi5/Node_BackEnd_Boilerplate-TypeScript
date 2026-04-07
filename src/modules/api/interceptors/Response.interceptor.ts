import { Injectable, Inject, Scope, NestInterceptor, CallHandler, ExecutionContext, StreamableFile } from '@nestjs/common';
import { Observable, tap, catchError } from 'rxjs';
import CryptographyService from '@core/security/Cryptography.service';
import LoggerService, { REQUEST_LOGGER_PROVIDER } from '@core/logging/Logger.service';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import { isDefined, isNullOrUndefined, normalizeToArray } from '@common/utils/dataValidations.util';
import { fromDateTimeToEpoch, getDateTimeNow } from '@common/utils/dates.util';
import { TimeZonesEnum } from '@common/enums/timeZones.enum';
import { maskBuffer, maskObjectSensitiveData } from '@common/utils/masks.util';
import { RequestInterface, ResponseInterface } from '@shared/internal/interfaces/endpointInterface';


@Injectable({ scope: Scope.REQUEST })
export default class ResponseInterceptor implements NestInterceptor {
	constructor(
		private readonly cryptographyService: CryptographyService,
		private readonly dataParserHelper: DataParserHelper,
		@Inject(REQUEST_LOGGER_PROVIDER) private readonly logger: LoggerService,
	) { }

	public intercept(context: ExecutionContext, next: CallHandler<unknown>): Observable<unknown> | Promise<Observable<unknown>> {
		const requestDateNow = fromDateTimeToEpoch(getDateTimeNow(TimeZonesEnum.America_SaoPaulo), 'milliseconds', true);

		const httpContext = context.switchToHttp();
		const request = httpContext.getRequest<RequestInterface>();
		const response = httpContext.getResponse<ResponseInterface>();

		const { method, params, query, body, headers } = request;

		const [headerRequestId] = normalizeToArray<string | undefined>(headers['x-request-id']);
		const requestId = headerRequestId ?? request?.id ?? this.cryptographyService.generateUuid();
		if (requestId) {
			request.id = requestId;
			response.header('x-request-id', requestId);
			this.logger.setRequestId(requestId);
		}

		const clientIp = request?.ip ?? request?.socket?.remoteAddress;
		if (clientIp) {
			this.logger.setClientIp(clientIp);
		}

		const path = this.getRequestPath(request);
		const reqMethod = method.toUpperCase();
		const userId = request?.user?.clientId ?? 'undefined';
		const pathParams = this.parseRequestDataToString(params);
		const queryParams = this.parseRequestDataToString(query);
		const reqBody = this.parseRequestDataToString(body);

		const [headerRequestDate] = normalizeToArray(headers['x-request-timestamp']);
		const requestDateMs = isDefined(headerRequestDate) ? parseInt(headerRequestDate, 10) : requestDateNow;

		this.logger.http(`REQUESTED - [${reqMethod}] ${path} { pathParams: ${pathParams}, queryParams: ${queryParams}, body: ${reqBody}, userId: ${userId} }`);

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

	private parseRequestDataToString(requestData: unknown): string {
		let data = requestData;

		if (requestData instanceof StreamableFile || requestData instanceof ArrayBuffer || Buffer.isBuffer(requestData)) {
			data = maskBuffer(requestData);
		} else if (typeof requestData === 'object' && requestData !== null) {
			data = maskObjectSensitiveData(requestData);
		}

		return JSON.stringify(data);
	}

	private parseResponseDataToString(responseData: unknown): string {
		let data = responseData;

		if (responseData instanceof StreamableFile || responseData instanceof ArrayBuffer || Buffer.isBuffer(responseData)) {
			data = maskBuffer(responseData);
		} else if (typeof responseData === 'object' && responseData !== null) {
			data = maskObjectSensitiveData(responseData);
		}

		const returnUndefined = false;
		return this.dataParserHelper.toString(data, returnUndefined);
	}

	private getTimestamp(requestDateMs: number | undefined): string {
		const responseDateMs = fromDateTimeToEpoch(getDateTimeNow(TimeZonesEnum.America_SaoPaulo), 'milliseconds', true);
		const timestamp = !isNullOrUndefined(requestDateMs)
			? String(Math.abs(responseDateMs - requestDateMs))
			: 'UNDEFINED';

		return timestamp;
	}
}
