import { containerType } from 'src/types/_containerType';


export default class Application {
	logger: containerType;
	getUsersOperation: containerType;

	constructor({ logger, getUsersOperation }: containerType) {
		this.logger = logger;
		this.getUsersOperation = getUsersOperation;
	}

	async start() {
		this.logger.info('Started Application');
		this.getUsersOperation.execute({});
	}
}
