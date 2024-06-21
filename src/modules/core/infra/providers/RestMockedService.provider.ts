import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigsInterface } from '@core/configs/configs.config';
import AbstractRestClient from '@core/infra/integration/rest/AbstractRestClient.client';
import LoggerService from '@core/logging/Logger.service';
import catchError from '@common/utils/externalErrorParser.util';
import { requestMethodType } from '@shared/internal/types/restClientTypes';
import { RestClientResponseInterface } from '@shared/external/interfaces/RestClientInterface';


@Injectable()
export default class RestMockedServiceProvider extends AbstractRestClient {
	constructor(
		configService: ConfigService,
		logger: LoggerService,
	) {
		const { baseUrl, serviceName, timeout } = configService.get<ConfigsInterface['integration']['rest']['mockedService']>('integration.rest.mockedService')!;

		super({
			serviceName,
			baseUrl,
			timeout,
			logger,
		});
	}

	public async healthcheck() {
		const request = await this.makeRequest<{
			url: string, statusCode: number, method: string,
			params: { [key: string]: unknown },
			query: { [key: string]: unknown },
			body: { [key: string]: unknown },
		}>({
			requestMethod: 'get',
			requestEndpoint: 'mockedService/api/check',
		});

		if (request.status !== 200)
			return request.error;

		return request.data;
	}

	public async requestHook<RI = unknown>(
		requestEndpoint: string, requestMethod: requestMethodType,
		body: unknown, queryParams?: unknown): Promise<RestClientResponseInterface<RI>> {
		const requestFunction = this.client[requestMethod];

		try {
			this.logger.http(`Requesting ${this.serviceName}: [${requestMethod.toUpperCase()}] '${requestEndpoint}' to pull hook`);
			const { data, status, headers } = await requestFunction<RI>(requestEndpoint,
				{ data: body, params: queryParams },
				{ data: body, params: queryParams });
			return { data, status, headers };
		} catch (error) {
			this.logger.error(error);
			throw catchError(error);
		}
	}
}
