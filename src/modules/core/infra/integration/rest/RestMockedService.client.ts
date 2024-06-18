import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { ConfigsInterface } from '@core/configs/configs.config';
import LoggerService from '@core/logging/Logger.service';
import catchError from '@common/utils/errorCatcher.util';
import { RestClientResponseInterface, requestMethodType } from '@shared/types/restClientTypes';


@Injectable()
export default class RestMockedServiceClient {
	private serviceName: string;
	private client: AxiosInstance;

	constructor(
		private readonly configService: ConfigService,
		private readonly logger: LoggerService,
	) {
		const { baseUrl, serviceName, timeout } = this.configService.get<ConfigsInterface['integration']['rest']['mockedService']>('integration.rest.mockedService')!;

		this.serviceName = serviceName;
		this.client = axios.create({
			baseURL: baseUrl,
			timeout,
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
			throw catchError(error);
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
			throw catchError(error);
		}
	}
}
