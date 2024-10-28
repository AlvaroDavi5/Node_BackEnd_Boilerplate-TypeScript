import axios, { AxiosInstance, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import LoggerService from '@core/logging/Logger.service';
import externalErrorParser from '@common/utils/externalErrorParser.util';
import { requestMethodType } from '@shared/internal/types/restClientTypes';
import { RestClientResponseInterface } from '@shared/external/interfaces/RestClientInterface';


export default abstract class AbstractRestClient {
	protected readonly serviceName: string;
	protected readonly client: AxiosInstance;
	protected readonly logger: LoggerService;

	constructor({
		serviceName, baseUrl,
		timeout, maxRetries, maxRedirects,
		logger,
	}: {
		baseUrl: string, serviceName: string, timeout: number, maxRetries: number, maxRedirects: number,
		logger: LoggerService,
	}) {
		this.logger = logger;

		this.serviceName = serviceName;
		this.client = axios.create({
			baseURL: baseUrl,
			timeout, maxRedirects,
			beforeRedirect: (options, responseDetails): void => {
				this.logger.warn('Request redirected - ', options, responseDetails);
			},
		});

		axiosRetry(this.client, {
			retries: maxRetries,
			retryDelay: (retryCount: number): number => {
				this.logger.warn(`Request failed - attempt: ${retryCount}`);
				return timeout / (retryCount || 1);
			},
		});
	}

	protected async makeRequest<RI = unknown>(
		requestMethod: requestMethodType, requestEndpoint: string,
		query?: { [key: string]: unknown }, body?: { [key: string]: unknown },
	): Promise<RestClientResponseInterface<RI, Error>> {
		let requestCaller: Promise<AxiosResponse<RI, unknown>>;

		switch (requestMethod) {
			case 'get':
				requestCaller = this.client.get<RI>(requestEndpoint, { params: query });
				break;
			case 'post':
				requestCaller = this.client.post<RI>(requestEndpoint, body, { params: query });
				break;
			case 'put':
				requestCaller = this.client.put<RI>(requestEndpoint, body, { params: query });
				break;
			case 'patch':
				requestCaller = this.client.patch<RI>(requestEndpoint, body, { params: query });
				break;
			case 'delete':
				requestCaller = this.client.delete<RI>(requestEndpoint, { params: query });
				break;
			default:
				requestCaller = this.client.get<RI>(requestEndpoint, { params: query, data: body });
				break;
		}

		try {
			this.logger.http(`REQUESTING - ${this.serviceName}: [${requestMethod.toUpperCase()}] '${requestEndpoint}'`);
			const { data, status, headers } = await requestCaller;
			return { data, status, headers };
		} catch (error) {
			this.logger.error(error);
			throw externalErrorParser(error);
		}
	}
}
