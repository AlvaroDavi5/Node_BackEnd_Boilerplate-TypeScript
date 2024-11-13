import LoggerService from '@core/logging/Logger.service';
import { requestMethodType, requestQueryType, requestBodyType } from '@shared/internal/types/restClientTypes';
import { RestClientResponseInterface } from '@shared/external/interfaces/RestClientInterface';
import { MockObservableInterface } from '../mockObservable';


export default abstract class AbstractRestClient {
	protected readonly logger: LoggerService;
	protected readonly serviceName: string;
	protected readonly mockObservable: MockObservableInterface<RestClientResponseInterface<unknown>, unknown[]>;

	constructor({
		serviceName,
		logger,
		mockObservable,
	}: {
		serviceName: string,
		logger: LoggerService,
		mockObservable: MockObservableInterface<RestClientResponseInterface<unknown>, unknown[]>,
	}) {
		this.logger = logger;
		this.serviceName = serviceName;
		this.mockObservable = mockObservable;
	}

	protected get(endpoint: string, query?: requestQueryType): RestClientResponseInterface<unknown> {
		return this.makeRequest('get', endpoint, query);
	}

	protected post(endpoint: string, body?: requestBodyType, query?: requestQueryType): RestClientResponseInterface<unknown> {
		return this.makeRequest('post', endpoint, query, body);
	}

	protected put(endpoint: string, body?: requestBodyType, query?: requestQueryType): RestClientResponseInterface<unknown> {
		return this.makeRequest('put', endpoint, query, body);
	}

	protected patch(endpoint: string, body?: requestBodyType, query?: requestQueryType): RestClientResponseInterface<unknown> {
		return this.makeRequest('patch', endpoint, query, body);
	}

	protected delete(endpoint: string, query?: requestQueryType): RestClientResponseInterface<unknown> {
		return this.makeRequest('delete', endpoint, query);
	}

	protected makeRequest(
		method: requestMethodType, endpoint: string,
		query?: requestQueryType, body?: requestBodyType
	): RestClientResponseInterface<unknown> {
		try {
			this.logger.http(`REQUESTING - ${this.serviceName}: [${method.toUpperCase()}] '${endpoint}'`);
			return this.mockObservable.call({ method, url: endpoint, params: query, data: body });
		} catch (error) {
			this.logger.error(error);
			throw error;
		}
	}
}
