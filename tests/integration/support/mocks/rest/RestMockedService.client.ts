import { Injectable } from '@nestjs/common';
import LoggerGenerator from '../logging/LoggerGenerator.logger';
import { MockObservableInterface } from '../mockObservable';


@Injectable()
export default class RestMockedServiceClient {
	private serviceName: string;
	private readonly logger: any;

	constructor(
		private readonly loggerGenerator: LoggerGenerator,
		private readonly mockObservable: MockObservableInterface,
	) {
		this.logger = this.loggerGenerator.getLogger();
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
