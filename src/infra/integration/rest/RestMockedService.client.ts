import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { Logger } from 'winston';
import { ConfigsInterface } from '@configs/configs.config';
import LoggerGenerator from '@infra/logging/LoggerGenerator.logger';


@Injectable()
export default class RestMockedServiceClient {
	private serviceName: string;
	private client: AxiosInstance;
	private readonly logger: Logger;

	constructor(
		private readonly configService: ConfigService,
		private readonly loggerGenerator: LoggerGenerator,
	) {
		this.logger = this.loggerGenerator.getLogger();
		const mockedServiceConfigs: ConfigsInterface['integration']['rest']['mockedService'] = this.configService.get<any>('integration.rest.mockedService');
		const { baseUrl, serviceName } = mockedServiceConfigs;

		this.serviceName = serviceName || 'mockedService';
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

	public async test(): Promise<any> {
		try {
			this.logger.info(`Requesting ${this.serviceName} to healthcheck`);
			const { data } = await this.client.get('mockedService/api/check');
			return data;
		} catch (error) {
			this.logger.error(error);
			return null;
		}
	}
}
