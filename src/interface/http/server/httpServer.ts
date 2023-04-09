import { createServer, Server } from 'http';
import { Logger } from 'winston';
import { ConfigsInterface } from 'configs/configs';
import { ContainerInterface } from 'src/types/_containerInterface';


export default class HttpServer {
	private server: Server;
	private configs: ConfigsInterface;
	private logger: Logger;
	private environment: string;

	constructor({
		restServer,
		logger,
		configs,
	}: ContainerInterface) {
		this.configs = configs;
		this.logger = logger;
		this.server = createServer(restServer.get());
		this.environment = configs.application.environment || 'dev';
	}

	getServer() {
		return this.server;
	}

	start() {
		const serverPort = this.configs.application.port || '3000';

		return this.server.listen(parseInt(serverPort), () => {
			this.logger.info(`Server started on port: ${serverPort} - Environment: ${this.environment}`);
		});
	}
}
