import { config } from 'aws-sdk';
import { genericType, ContainerInterface } from 'src/container';


export default class Application {
	httpServer: genericType;
	webSocketServer: genericType;
	eventsQueueConsumer: genericType;
	syncCron: genericType;
	logger: genericType;
	configs: genericType;
	isSocketEnvEnabled: boolean;

	/**
	@param {Object} ctx - Dependency Injection (container)
	@param {import('src/interface/http/server/httpServer')} ctx.httpServer
	@param {import('src/interface/webSocket/Server')} ctx.webSocketServer
	@param {import('src/infra/integration/queue/consumers/EventsQueueConsumer')} ctx.eventsQueueConsumer
	@param {import('src/infra/cron/SyncCron')}  ctx.syncCron
	@param {import('src/infra/logging/logger')} ctx.logger
	@param {import('configs/configs')} ctx.configs
	**/
	constructor({
		httpServer,
		webSocketServer,
		eventsQueueConsumer,
		syncCron,
		logger,
		configs,
	}: ContainerInterface) {
		this.httpServer = httpServer;
		this.webSocketServer = webSocketServer;
		this.eventsQueueConsumer = eventsQueueConsumer;
		this.syncCron = syncCron;
		this.logger = logger;
		this.configs = configs;
		this.isSocketEnvEnabled = configs?.application?.socketEnv === 'enabled';
	}

	startCrons() {
		this.syncCron.start();
		this.logger.info('Sync cron started');
	}

	startQueueConsumers() {
		this.eventsQueueConsumer.start();
		this.logger.info('Events queue consumer started');
	}

	async start() {
		// AWS Configs
		config.update({
			...this.configs?.integration?.aws?.credentials,
		});

		// Servers
		if (this.isSocketEnvEnabled) {
			this.webSocketServer.start();
		}
		this.httpServer.start();

		// Background Services
		this.startCrons();
		this.startQueueConsumers();
	}
}
