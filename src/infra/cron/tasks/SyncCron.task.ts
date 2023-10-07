import { Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import MongoClient from '@infra/data/Mongo.client';
import RedisClient from '@infra/cache/Redis.client';
import WebSocketServer from '@modules/events/websocket/server/WebSocket.server';
import WebSocketClient from '@modules/events/websocket/client/WebSocket.client';
import LoggerGenerator from '@infra/logging/LoggerGenerator.logger';
import connection, { testConnection, syncConnection } from '@infra/database/connection';


@Injectable()
export default class SyncCronTask {
	public readonly name: string;
	private readonly logger: Logger;

	constructor(
		private readonly mongoClient: MongoClient,
		private readonly redisClient: RedisClient,
		private readonly webSocketServer: WebSocketServer,
		private readonly webSocketClient: WebSocketClient,
		private readonly loggerGenerator: LoggerGenerator,
	) {
		this.name = SyncCronTask.name;
		this.logger = this.loggerGenerator.getLogger();
	}

	public async execute(): Promise<void> {
		this.logger.info(`Running ${this.name}`);

		let isDatabaseActive = false;
		let isDatalakeActive = false;
		let isCacheActive = false;
		let isWebsocketActive = false;

		try {
			isDatabaseActive = await testConnection(connection, this.logger);
			isDatalakeActive = this.mongoClient.isConnected;
			isCacheActive = this.redisClient.isConnected;
			isWebsocketActive = this.webSocketClient.isConnected();

			if (!isDatabaseActive) {
				await syncConnection(connection, this.logger);
				isDatabaseActive = await testConnection(connection);
			}
		} catch (error) {
			this.logger.error(error);
		}

		if (!isCacheActive || !isDatalakeActive || !isDatabaseActive || !isWebsocketActive) {
			this.logger.warn('Unavailable Backing Services, disconnecting all sockets');
			this.webSocketServer.disconnectAllSockets();
		}
	}
}
