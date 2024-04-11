import { Inject, Injectable } from '@nestjs/common';
import { LOGGER_PROVIDER } from '@core/infra/logging/Logger.provider';
import { MockObservableInterface } from '../mockObservable';
import LoggerProvider from '../logging/Logger.provider';


@Injectable()
export default class RestMockedServiceClient {
	private serviceName: string;
	private readonly logger: any;

	constructor(
		@Inject(LOGGER_PROVIDER)
		private readonly loggerProvider: LoggerProvider,
		private readonly mockObservable: MockObservableInterface,
	) {
		this.logger = this.loggerProvider.getLogger(RestMockedServiceClient.name);
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
