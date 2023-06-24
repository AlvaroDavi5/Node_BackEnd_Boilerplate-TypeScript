import cron from 'node-cron';
import connection, { testConnection, syncConnection } from 'src/infra/database/connection';
import { ContainerInterface } from 'src/types/_containerInterface';


export default ({
	webSocketServer,
	webSocketClient,
	redisClient,
	logger,
}: ContainerInterface) => {
	/*
	? second (0 - 59, optional)
	? minute (0 - 59)
	? hour (0 - 23)
	? day of month (1 - 31)
	? month (1 - 12)
	? day of week (0 - 7)
	*/
	const job = cron.schedule(
		'0 */2 * * * *', // // every 2 minutes
		async () => {
			logger.info('Running Sync cron');

			let isDatabaseActive = false;
			let isCacheActive = false;
			let isWebsocketActive = false;

			try {
				isDatabaseActive = await testConnection(connection, logger);
				isCacheActive = redisClient.isConnected();
				isWebsocketActive = webSocketClient.isConnected();

				if (!isDatabaseActive) {
					await syncConnection(connection, logger);
					isDatabaseActive = await testConnection(connection);
				}
			} catch (error) {
				logger.error(error);
			}

			if (!isCacheActive || !isDatabaseActive || !isWebsocketActive) {
				logger.warn('Unavailable Backing Services, disconnecting all sockets');
				webSocketServer.disconnectAllSockets();
			}
		},
		{
			name: 'SyncCron',
			timezone: 'America/Sao_Paulo',
			scheduled: true,
			runOnInit: false,
			recoverMissedExecutions: false,
		}
	);

	return job;
};
