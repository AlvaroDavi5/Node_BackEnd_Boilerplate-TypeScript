import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { Logger } from 'winston';
import { ConfigsInterface } from '@core/configs/configs.config';
import { LOGGER_PROVIDER, LoggerProviderInterface } from '@core/infra/logging/Logger.provider';


export type requestMethodType = 'get' | 'post' | 'put' | 'patch' | 'delete';

interface ResponseInterface {
	status: number,
	data: unknown,
}

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
		const mockedServiceConfigs: ConfigsInterface['integration']['rest']['mockedService'] = this.configService.get<any>('integration.rest.mockedService');
		const { baseUrl, serviceName } = mockedServiceConfigs;

		this.serviceName = serviceName;
		this.client = axios.create({
			baseURL: baseUrl,
			timeout: 1000, // 1s
		});

		axiosRetry(this.client, {
			retries: 3,
			retryDelay: (retryCount) => {
				this.logger.warn(`Request failed - attempt: ${retryCount}`);
				return retryCount * 2000;
			},
		});
	}

	public async healthcheck(): Promise<ResponseInterface> {
		try {
			this.logger.info(`Requesting ${this.serviceName} to healthcheck`);
			const { data, status } = await this.client.get('mockedService/api/check');
			return { data, status };
		} catch (error) {
			this.logger.error(error);
			return { data: null, status: 0 };
		}
	}

	public async requestHook(requestEndpoint: string, requestMethod: requestMethodType, body: any, ...args: any[]): Promise<ResponseInterface> {
		const requestFunction = this.client[requestMethod];

		try {
			this.logger.info(`Requesting [${requestMethod.toUpperCase()}] '${requestEndpoint}' to pull hook`);
			const { data, status } = await requestFunction(requestEndpoint, body, ...args);
			return { data, status };
		} catch (error) {
			this.logger.error(error);
			return { data: null, status: 0 };
		}
	}
}
