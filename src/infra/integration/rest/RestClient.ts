import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { Logger } from 'winston';
import { ContainerInterface } from 'src/types/_containerInterface';


export default class RestClient {
	private serviceName: string;
	private client: AxiosInstance;
	private logger: Logger;

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
			const { data } = await this.client.get('/check');
			return data;
		} catch (error) {
			this.logger.error(error);
			return {};
		}
	}
}
