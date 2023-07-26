import { Injectable } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { Logger } from 'winston';
import RedisClient from '@infra/cache/Redis.client';
import WebSocketServer from '@modules/events/websocket/server/WebSocket.server';
import WebSocketClient from '@modules/events/websocket/client/WebSocket.client';
import LoggerGenerator from '@infra/logging/LoggerGenerator.logger';
import connection, { testConnection, syncConnection } from '@infra/database/connection';


@Injectable()
export default class SyncCron {
	private readonly name: string;
	public readonly cronExpression: CronExpression;
	private readonly logger: Logger;

	constructor(
		private readonly schedulerRegistry: SchedulerRegistry,
		private readonly redisClient: RedisClient,
		private readonly webSocketServer: WebSocketServer,
		private readonly webSocketClient: WebSocketClient,
		private readonly loggerGenerator: LoggerGenerator,
	) {
		this.logger = this.loggerGenerator.getLogger();
		this.name = SyncCron.name;
		this.cronExpression = CronExpression.EVERY_5_MINUTES;
	}

	/*
	? second (0 - 59, optional)
	? minute (0 - 59)
	? hour (0 - 23)
	? day of month (1 - 31)
	? month (1 - 12)
	? day of week (0 - 7)
	*/
	@Cron('0 */5 * * * *', {
		// // every 5 minutes
		name: 'SyncCron',
		timeZone: 'America/Sao_Paulo',
		disabled: false,
		unrefTimeout: false,
	})
	public async handleCron(): Promise<void> {
		this.logger.info('Running Sync cron');

		let isDatabaseActive = false;
		let isCacheActive = false;
		let isWebsocketActive = false;

		try {
			isDatabaseActive = await testConnection(connection, this.logger);
			isCacheActive = this.redisClient.isConnected();
			isWebsocketActive = this.webSocketClient.isConnected();

			if (!isDatabaseActive) {
				await syncConnection(connection, this.logger);
				isDatabaseActive = await testConnection(connection);
			}
		} catch (error) {
			this.logger.error(error);
		}

		if (!isCacheActive || !isDatabaseActive || !isWebsocketActive) {
			this.logger.warn('Unavailable Backing Services, disconnecting all sockets');
			this.webSocketServer.disconnectAllSockets();
		}
	}

	public stopCron(): void {
		const job = this.schedulerRegistry.getCronJob(this.name);
		job.stop();
	}

	public getLastJobDate(): Date {
		const job = this.schedulerRegistry.getCronJob(this.name);
		return job.lastDate();
	}
}
