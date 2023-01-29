import { containerType, ContainerInterface } from 'src/types/_containerInterface';


export default class Application {
	httpServer: containerType;
	webSocketServer: containerType;
	eventsQueueConsumer: containerType;
	syncCron: containerType;
	isSocketEnvEnabled: containerType;
	logger: containerType;

	/**
	@param {Object} ctx - Dependency Injection (container)
	@param {import('src/interface/http/server/httpServer')} ctx.httpServer
	@param {import('src/interface/webSocket/Server')} ctx.webSocketServer
	@param {import('src/infra/integration/queue/consumers/EventsQueueConsumer')} ctx.eventsQueueConsumer
	@param {import('src/infra/cron/SyncCron')}  ctx.syncCron
	@param {import('src/infra/logging/logger')} ctx.logger
	@param {import('config/index')} ctx.config
	**/
	constructor({
		httpServer,
		webSocketServer,
		eventsQueueConsumer,
		syncCron,
		logger,
		config,
	}: ContainerInterface) {
		this.httpServer = httpServer;
		this.webSocketServer = webSocketServer;
		this.eventsQueueConsumer = eventsQueueConsumer;
		this.syncCron = syncCron;
		this.isSocketEnvEnabled = config?.application?.socketEnv === 'enabled';
		this.logger = logger;
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
		if (this.isSocketEnvEnabled) {
			this.webSocketServer.start();
		}

		this.httpServer.start();
		this.startCrons();
		this.startQueueConsumers();
	}
}
