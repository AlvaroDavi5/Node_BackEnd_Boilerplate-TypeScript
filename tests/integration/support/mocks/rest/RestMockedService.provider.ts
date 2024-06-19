import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigsInterface } from '@core/configs/configs.config';
import AbstractRestClient from './AbstractRestClient.client';
import LoggerService from '@core/logging/Logger.service';
import catchError from '@common/utils/errorCatcher.util';
import { requestMethodType } from '@shared/internal/types/restClientTypes';
import { RestClientResponseInterface } from '@shared/external/interfaces/RestClientInterface';
import { MockObservableInterface } from '../mockObservable';


@Injectable()
export default class RestMockedServiceProvider extends AbstractRestClient {
	constructor(
		configService: ConfigService,
		logger: LoggerService,
		mockObservable: MockObservableInterface<RestClientResponseInterface<unknown, unknown>, unknown[]>,
	) {
		const { serviceName } = configService.get<ConfigsInterface['integration']['rest']['mockedService']>('integration.rest.mockedService')!;

		super({
			serviceName,
			mockObservable,
			logger,
		});
	}

	public async healthcheck() {
		const request = await this.makeRequest({
			requestMethod: 'get',
			requestEndpoint: 'mockedService/api/check',
		});

		if (request.status !== 200)
			return request.error;

		return request.data;
	}

	public async requestHook(
		requestEndpoint: string, requestMethod: requestMethodType,
		body: unknown, queryParams?: unknown): Promise<RestClientResponseInterface<unknown>> {
		try {
			this.logger.http(`Requesting ${this.serviceName}: [${requestMethod.toUpperCase()}] '${requestEndpoint}' to pull hook`);
			return this.mockObservable.call(requestMethod, requestEndpoint, body, queryParams);
		} catch (error) {
			this.logger.error(error);
			throw catchError(error);
		}
	}
}
