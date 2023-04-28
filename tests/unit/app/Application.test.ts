import Application from '../../../src/app/Application';


describe('App :: Application', function () {
	const webSocketServer: any = {
		start: jest.fn()
	},
		httpServer: any = {
			start: jest.fn()
		},
		eventsQueueConsumer: any = {
			start: jest.fn()
		},
		syncCron: any = {
			start: jest.fn()
		},
		logger: any = {
			info: jest.fn()
		},
		configs: any = {};
	let app: any = null;

	describe('# start with WebSocket server', () => {
		beforeEach(() => {
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
