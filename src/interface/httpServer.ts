import { createServer } from 'http';
import dotenv from 'dotenv';
import { containerInterface, containerType } from 'src/types/_containerInterface';
dotenv.config();


export default class HttpServer {
	configs: containerType;
	logger: containerType;
	environment: string | undefined;
	server: any;

	/**
	@param {Object} ctx - Dependency Injection (container)
	@param {import('src/interface/api/http/server/restServer')} ctx.restServer
	@param {import('src/infra/logging/logger')} ctx.logger
	@param {import('configs/staticConfigs')} ctx.configs
	**/
	constructor({
		restServer,
		logger,
		configs,
	}: containerInterface) {
		this.configs = configs;
		this.logger = logger;
		this.server = createServer(restServer.get());
		this.environment = process.env.NODE_ENV;
	}

	start() {
		const serverPort = this.configs.application.port;

		return this.server.listen(serverPort || 3000, () => {
			this.logger.info(`Server started on port: ${serverPort} - Environment ${this.environment}`);
		});
	}
}
