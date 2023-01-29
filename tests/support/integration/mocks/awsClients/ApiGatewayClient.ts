
export default class ApiGatewayClient {
	formatter: any;
	exception: any;
	logger: any;

	constructor({
		formatMessageBeforeSendHelper,
		exception,
		logger,
	}) {
		this.formatter = formatMessageBeforeSendHelper;
		this.exception = exception;
		this.logger = logger;
	}

	async getConnection(connectionId: string) {
		if (connectionId?.length) {
			return {};
		}

		return null;
	}

	async deleteConnection(connectionId: string) {
		if (connectionId?.length) {
			return true;
		}

		return false;
	}

	async postToConnection(connectionId: string, data: string) {
		try {
			if (!connectionId?.length) {
				return false;
			}
			this.formatter.execute(data);

			return true;
		} catch (error) {
			return error;
		}
	}
}
