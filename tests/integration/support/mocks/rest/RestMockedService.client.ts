import { Injectable } from '@nestjs/common';
import LoggerService from '../logging/Logger.service';
import { MockObservableInterface } from '../mockObservable';


@Injectable()
export default class RestMockedServiceClient {
	private serviceName: string;

	constructor(
		private readonly logger: LoggerService,
		private readonly mockObservable: MockObservableInterface,
	) {
		this.logger.setContextName(RestMockedServiceClient.name);
		this.serviceName = process.env.MOCKED_SERVICE_NAME || 'mockedService';
	}

	public async test(): Promise<any> {
		this.mockObservable.call();

		try {
			this.logger.info(`Requesting ${this.serviceName} to healthcheck`);
			return {
				url: '/api/check',
				statusCode: 200,
				method: 'GET',
				query: {},
				params: {},
				body: {},
			};
		} catch (error) {
			this.logger.error(error);
			return null;
		}
	}
}
