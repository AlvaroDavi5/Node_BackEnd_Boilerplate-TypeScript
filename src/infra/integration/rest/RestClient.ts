import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { Logger } from 'winston';
import { ContainerInterface } from 'src/container';


export default class EntitiesClient {
	serviceName: string;
	client: AxiosInstance;
	logger: Logger;

	/**
	@param {Object} ctx - Dependency Injection.
	@param {import('src/infra/logging/logger')} ctx.logger
	@param {import('configs/configs')} ctx.configs
	**/
	constructor(
		{ logger,
			configs,
		}: ContainerInterface) {
		const { baseUrl, serviceName } = configs.integration.rest.mockedService;

		this.serviceName = serviceName;
		this.client = axios.create({
			baseURL: baseUrl,
			timeout: 1000, // 1s
		});
		this.logger = logger;

		axiosRetry(this.client, {
			retries: 3,
			retryDelay: (retryCount) => {
				this.logger.info(`Request failed - attempt: ${retryCount}`);
				return retryCount * 2000;
			},
		});
	}

	async test() {
		try {
			this.logger.info(`Requesting ${this.serviceName} to healthcheck`);
			const { data } = await this.client.get('/healthcheck');
			return data;
		} catch (error) {
			this.logger.error(error);
			return {};
		}
	}
}
