import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigsInterface } from '@core/configs/envs.config';
import AbstractRestClient from '@core/infra/integration/rest/AbstractRestClient.client';
import LoggerService from '@core/logging/Logger.service';
import { requestMethodType } from '@shared/internal/types/restClientTypes';
import { RestClientResponseInterface } from '@shared/external/interfaces/RestClientInterface';


@Injectable()
export default class RestMockedServiceProvider extends AbstractRestClient {
	constructor(
		configService: ConfigService,
		logger: LoggerService,
	) {
		const { baseUrl, serviceName, timeout, maxRetries, maxRedirects } = configService.get<ConfigsInterface['integration']['rest']['mockedService']>('integration.rest.mockedService')!;

		super({
			serviceName, baseUrl,
			timeout, maxRedirects, maxRetries,
			logger,
		});
	}

	public async healthcheck() {
		this.logger.info('Requesting healthcheck endpoint');

		const request = await this.makeRequest<{
			url: string, statusCode: number, method: string,
			params: { [key: string]: unknown },
			query: { [key: string]: unknown },
			body: { [key: string]: unknown },
		}>('get', 'mockedService/api/check');

		if (request.status !== 200)
			return request.error;

		return request.data;
	}

	public async requestHook<RI = unknown>(
		requestMethod: requestMethodType, requestEndpoint: string,
		queryParams?: { [key: string]: unknown }, body?: { [key: string]: unknown },
	): Promise<RestClientResponseInterface<RI>> {
		this.logger.info('Requesting webhook endpoint');

		const { data, status, headers, error } = await this.makeRequest<RI>(
			requestMethod, requestEndpoint,
			queryParams, body,
		);

		return { data, status, headers, error };
	}
}
