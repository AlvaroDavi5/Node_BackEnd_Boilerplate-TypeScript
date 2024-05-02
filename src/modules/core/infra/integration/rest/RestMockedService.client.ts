import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { Logger } from 'winston';
import { ConfigsInterface } from '@core/configs/configs.config';
import { LOGGER_PROVIDER, LoggerProviderInterface } from '@core/infra/logging/Logger.provider';
import { RestClientResponseInterface, requestMethodType } from '@shared/types/restClientTypes';


@Injectable()
export default class RestMockedServiceClient {
	private serviceName: string;
	private client: AxiosInstance;
	private readonly logger: Logger;

	constructor(
		private readonly configService: ConfigService,
		@Inject(LOGGER_PROVIDER)
		private readonly loggerProvider: LoggerProviderInterface,
	) {
		this.logger = this.loggerProvider.getLogger(RestMockedServiceClient.name);
		const { baseUrl, serviceName, timeout } = this.configService.get<ConfigsInterface['integration']['rest']['mockedService']>('integration.rest.mockedService')!;

		this.serviceName = serviceName;
		this.client = axios.create({
			baseURL: baseUrl,
			timeout: timeout,
		});

		axiosRetry(this.client, {
			retries: 3,
			retryDelay: (retryCount: number) => {
				this.logger.warn(`Request failed - attempt: ${retryCount}`);
				return retryCount * 2000;
			},
		});
	}

	public async healthcheck(): Promise<RestClientResponseInterface<{
		url: any,
		statusCode: any,
		method: any,
		query: any,
		params: any,
		body: any,
	} | null>> {
		try {
			this.logger.info(`Requesting ${this.serviceName} to healthcheck`);
			const { data, status } = await this.client.get('mockedService/api/check');
			return { data, status };
		} catch (error) {
			this.logger.error(error);
			return { data: null, error, status: (error as any)?.response?.status };
		}
	}

	public async requestHook(requestEndpoint: string, requestMethod: requestMethodType, body: any, ...args: any[]): Promise<RestClientResponseInterface<any>> {
		const requestFunction = this.client[requestMethod];

		try {
			this.logger.info(`Requesting ${this.serviceName}: [${requestMethod.toUpperCase()}] '${requestEndpoint}' to pull hook`);
			const { data, status } = await requestFunction(requestEndpoint, body, ...args);
			return { data, status };
		} catch (error) {
			this.logger.error(error);
			return { data: null, error, status: (error as any)?.response?.status };
		}
	}
}
