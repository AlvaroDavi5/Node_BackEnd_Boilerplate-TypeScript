import { containerType, containerInterface } from 'src/types/_containerInterface';


export default class Application {
	httpServer: containerType;
	logger: containerType;

	/**
	@param {Object} ctx - Dependency Injection (container)
	@param {import('src/interface/httpServer')} ctx.httpServer
	@param {import('src/infra/logging/logger')} ctx.logger
	**/
	constructor({
		httpServer,
		logger,
	}: containerInterface) {
		this.httpServer = httpServer;
		this.logger = logger;
	}

	async start() {
		this.logger.info('Started Application');
		this.httpServer.start();
	}
}
