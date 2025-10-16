import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigsInterface } from '@core/configs/envs.config';
import AbstractRestClient from '@core/infra/integration/rest/AbstractRestClient.client';
import LoggerService from '@core/logging/Logger.service';
import { requestMethodType, requestQueryType, requestBodyType } from '@shared/internal/types/restClientTypes';
import { RestClientResponseInterface } from '@shared/external/interfaces/RestClientInterface';


interface HealthCheckResponseInterface {
	url: string, statusCode: number, method: string,
	params: Record<string, unknown>,
	query: Record<string, unknown>,
	body: Record<string, unknown>,
}

@Injectable()
export default class RestMockedServiceProvider extends AbstractRestClient {
	constructor(
		configService: ConfigService,
		logger: LoggerService,
	) {
		const {
			baseUrl, serviceName,
			timeout, maxRetries, maxRedirects
		} = configService.get<ConfigsInterface['integration']['rest']['mockedService']>('integration.rest.mockedService')!;

		super({
			serviceName, baseUrl,
			timeout, maxRedirects, maxRetries,
			logger,
		});
	}

	public async healthcheck(): Promise<HealthCheckResponseInterface> {
		this.logger.info('Requesting healthcheck endpoint');

		const { data } = await this.get<HealthCheckResponseInterface>('mockedService/api/check');

		return data;
	}

	public async requestHook<RI = unknown>(
		requestMethod: requestMethodType, requestEndpoint: string,
		queryParams?: requestQueryType, body?: requestBodyType,
	): Promise<RestClientResponseInterface<RI>> {
		this.logger.info('Requesting webhook endpoint');

		const { data, status, headers } = await this.makeRequest<RI>(requestMethod, requestEndpoint, queryParams, body);

		return { data, status, headers };
	}
}
