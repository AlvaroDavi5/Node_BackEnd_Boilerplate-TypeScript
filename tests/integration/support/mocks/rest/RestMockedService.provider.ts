import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigsInterface } from '@core/configs/envs.config';
import LoggerService from '@core/logging/Logger.service';
import { requestMethodType, requestQueryType, requestBodyType } from '@shared/internal/types/restClientTypes';
import { RestClientResponseInterface } from '@shared/external/interfaces/RestClientInterface';
import { MockObservableInterface } from '../mockObservable';
import AbstractRestClient from './AbstractRestClient.client';


@Injectable()
export default class RestMockedServiceProvider extends AbstractRestClient {
	constructor(
		configService: ConfigService,
		logger: LoggerService,
		mockObservable: MockObservableInterface<RestClientResponseInterface<unknown>, unknown[]>,
	) {
		const { serviceName } = configService.get<ConfigsInterface['integration']['rest']['mockedService']>('integration.rest.mockedService')!;

		super({
			serviceName,
			logger,
			mockObservable,
		});
	}

	public healthcheck() {
		this.logger.info('Requesting healthcheck endpoint');

		const { data } = this.get('mockedService/api/check');

		return data;
	}

	public requestHook(
		requestMethod: requestMethodType, requestEndpoint: string,
		queryParams?: requestQueryType, body?: requestBodyType,
	): RestClientResponseInterface<unknown> {
		this.logger.info('Requesting webhook endpoint');

		const { data, status, headers } = this.makeRequest(requestMethod, requestEndpoint, queryParams, body);

		return { data, status, headers };
	}
}
