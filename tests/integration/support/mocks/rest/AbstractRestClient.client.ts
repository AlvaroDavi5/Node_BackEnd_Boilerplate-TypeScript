import { LoggerInterface } from '@core/logging/logger';
import { requestMethodType } from '@shared/internal/types/restClientTypes';
import { RestClientResponseInterface } from '@shared/external/interfaces/RestClientInterface';
import { MockObservableInterface } from '../mockObservable';


export default abstract class AbstractRestClient {
	protected readonly serviceName: string;
	protected readonly logger: LoggerInterface;
	protected readonly mockObservable: MockObservableInterface<RestClientResponseInterface<unknown, unknown>, unknown[]>;

	constructor({
		serviceName,
		logger,
		mockObservable,
	}: {
		serviceName: string,
		logger: LoggerInterface,
		mockObservable: MockObservableInterface<RestClientResponseInterface<unknown, unknown>, unknown[]>,
	}) {
		this.mockObservable = mockObservable;
		this.logger = logger;
		this.serviceName = serviceName;
	}

	protected async makeRequest({ requestMethod, requestEndpoint, body, query }: {
		requestMethod: requestMethodType, requestEndpoint: string,
		body?: { [key: string]: unknown }, query?: { [key: string]: unknown },
	}): Promise<RestClientResponseInterface<unknown, unknown>> {
		try {
			this.logger.http(`Requesting ${this.serviceName}: [${requestMethod.toUpperCase()}] '${requestEndpoint}'`);
			return this.mockObservable.call(requestMethod, requestEndpoint, body, query);
		} catch (error) {
			this.logger.error(error);
			throw error;
		}
	}
}
