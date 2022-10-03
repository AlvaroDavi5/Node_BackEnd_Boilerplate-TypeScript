
export default class Application {
	logger: any;
	getUsersOperation: any;

	constructor({ logger, getUsersOperation }: any) {
		this.logger = logger;
		this.getUsersOperation = getUsersOperation;
	}

	async start() {
		this.logger.info('Started Application');
		this.getUsersOperation.execute({});
	}
}
