import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import MongoClient from '@core/infra/data/Mongo.client';
import RedisClient from '@core/infra/cache/Redis.client';
import LoggerService from '@core/logging/Logger.service';
import { DATABASE_CONNECTION_PROVIDER, testConnection, syncConnection } from '@core/infra/database/connection';
import WebSocketServer from '@events/websocket/server/WebSocket.server';
import WebSocketClient from '@events/websocket/client/WebSocket.client';


@Injectable()
export default class SyncCronTask {
	public readonly name: string;

	constructor(
		@Inject(DATABASE_CONNECTION_PROVIDER) private readonly connection: DataSource,
		private readonly mongoClient: MongoClient,
		private readonly redisClient: RedisClient,
		private readonly webSocketServer: WebSocketServer,
		private readonly webSocketClient: WebSocketClient,
		private readonly logger: LoggerService,
	) {
		this.name = SyncCronTask.name;
	}

	public async execute(): Promise<void> {
		this.logger.info(`Running ${this.name}`);

		let isDatabaseActive = false;
		let isDatalakeActive = false;
		let isCacheActive = false;
		let isWebsocketActive = false;

		try {
			isDatabaseActive = await testConnection(this.connection, this.logger);
			isDatalakeActive = this.mongoClient.isConnected;
			isCacheActive = this.redisClient.isConnected;
			isWebsocketActive = this.webSocketClient.isConnected();

			if (!isDatabaseActive) {
				await syncConnection(this.connection, this.logger);
				isDatabaseActive = await testConnection(this.connection, this.logger);
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
