import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import LoggerService from '@core/logging/Logger.service';
import externalErrorParser from '@common/utils/externalErrorParser.util';
import { requestMethodType, requestQueryType, requestBodyType } from '@shared/internal/types/restClientTypes';
import { RestClientResponseInterface } from '@shared/external/interfaces/RestClientInterface';


export default abstract class AbstractRestClient {
	protected readonly logger: LoggerService;
	protected readonly client: AxiosInstance;
	protected readonly serviceName: string;

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

	protected async get<RI = unknown>(endpoint: string, query?: requestQueryType): Promise<RestClientResponseInterface<RI>> {
		return await this.makeRequest<RI>('get', endpoint, query);
	}

	protected async post<RI = unknown>(endpoint: string, body?: requestBodyType, query?: requestQueryType): Promise<RestClientResponseInterface<RI>> {
		return await this.makeRequest<RI>('post', endpoint, query, body);
	}

	protected async put<RI = unknown>(endpoint: string, body?: requestBodyType, query?: requestQueryType): Promise<RestClientResponseInterface<RI>> {
		return await this.makeRequest<RI>('put', endpoint, query, body);
	}

	protected async patch<RI = unknown>(endpoint: string, body?: requestBodyType, query?: requestQueryType): Promise<RestClientResponseInterface<RI>> {
		return await this.makeRequest<RI>('patch', endpoint, query, body);
	}

	protected async delete<RI = unknown>(endpoint: string, query?: requestQueryType): Promise<RestClientResponseInterface<RI>> {
		return await this.makeRequest<RI>('delete', endpoint, query);
	}

	protected async makeRequest<RI = unknown>(
		method: requestMethodType, endpoint: string,
		query?: requestQueryType, body?: requestBodyType
	): Promise<RestClientResponseInterface<RI>> {
		try {
			this.logger.http(`REQUESTING - ${this.serviceName}: [${method.toUpperCase()}] '${endpoint}'`);
			const { data, status, headers } = await this.client.request<RI>({
				method, url: endpoint,
				params: query, data: body,
			});

			this.logger.verbose(`RESPONSE - ${this.serviceName}: [${method.toUpperCase()}] '${endpoint}'`, { data, status, headers });
			return { data, status, headers };
		} catch (error) {
			this.logger.error(`REQUEST ERROR - ${this.serviceName}: [${method.toUpperCase()}] '${endpoint}'`, error);
			throw externalErrorParser(error);
		}
	}
}
