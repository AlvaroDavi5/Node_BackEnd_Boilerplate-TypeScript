import { containerType, containerInterface } from 'src/types/_containerInterface';


export default class Application {
	logger: containerType;
	getUsersOperation: containerType;

	constructor({ logger, getUsersOperation }: containerInterface) {
		this.logger = logger;
		this.getUsersOperation = getUsersOperation;
	}

	async start() {
		this.logger.info('Started Application');
		this.getUsersOperation.execute({});
	}
}
