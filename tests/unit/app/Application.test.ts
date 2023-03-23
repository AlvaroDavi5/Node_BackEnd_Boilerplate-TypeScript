import Application from '../../../src/app/Application';


describe('App :: Application', function () {
	const webSocketServer: any = {},
		httpServer: any = {},
		eventsQueueConsumer: any = {},
		syncCron: any = {},
		logger: any = {},
		configs: any = {};
	let app: any = null;

	describe('# start with WebSocket server', () => {
		beforeEach(() => {
			webSocketServer.start = jest.fn();
			httpServer.start = jest.fn();
			eventsQueueConsumer.start = jest.fn();
			syncCron.start = jest.fn();
			logger.info = jest.fn();
			configs.application = {
				socketEnv: 'enabled',
			};
			app = new Application({
				webSocketServer,
				httpServer,
				eventsQueueConsumer,
				syncCron,
				logger,
				configs,
			});
		});
		it('should return success', async () => {
			await app.start();
			expect(webSocketServer.start).toHaveBeenCalled();
			expect(httpServer.start).toHaveBeenCalled();
			expect(eventsQueueConsumer.start).toHaveBeenCalled();
			expect(syncCron.start).toHaveBeenCalled();
			expect(app.isSocketEnvEnabled).toBeTruthy();
		});
	});
	describe('# start without WebSocket server', () => {
		beforeEach(() => {
			webSocketServer.start = jest.fn();
			httpServer.start = jest.fn();
			eventsQueueConsumer.start = jest.fn();
			syncCron.start = jest.fn();
			logger.info = jest.fn();
			configs.application = {};
			app = new Application({
				webSocketServer,
				httpServer,
				eventsQueueConsumer,
				syncCron,
				logger,
				configs,
			});
		});
		it('should return success', async () => {
			await app.start();
			expect(webSocketServer.start).not.toHaveBeenCalled();
			expect(httpServer.start).toHaveBeenCalled();
			expect(eventsQueueConsumer.start).toHaveBeenCalled();
			expect(syncCron.start).toHaveBeenCalled();
			expect(app.isSocketEnvEnabled).toBeFalsy();
		});
	});
});
