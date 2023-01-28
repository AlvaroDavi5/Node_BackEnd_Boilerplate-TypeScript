import { createServer } from 'http';
import { ContainerInterface, containerType } from 'src/types/_containerInterface';


export default class HttpServer {
	configs: containerType;
	logger: containerType;
	environment: string | undefined;
	server: any;

	/**
	@param {Object} ctx - Dependency Injection (container)
	@param {import('src/interface/http/server/restServer')} ctx.restServer
	@param {import('src/infra/logging/logger')} ctx.logger
	@param {import('configs/configs')} ctx.configs
	**/
	constructor({
		restServer,
		logger,
		configs,
	}: ContainerInterface) {
		this.configs = configs;
		this.logger = logger;
		this.server = createServer(restServer.get());
		this.environment = configs.application.environment || 'development';
	}

	start() {
		const serverPort = this.configs.application.port || 3000;

		return this.server.listen(parseInt(serverPort), () => {
			this.logger.info(`Server started on port: ${serverPort} - Environment ${this.environment}`);
		});
	}
}
