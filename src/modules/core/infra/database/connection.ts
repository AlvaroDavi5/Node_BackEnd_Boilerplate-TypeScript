import 'reflect-metadata';
import { Provider, Scope } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Logger } from 'winston';
import { dbConfig } from './db.config';
import LoggerService from '@core/logging/Logger.service';
import { LoggerInterface } from '@core/logging/logger';


/* connecting to a database */
/* passing Parameters separately (other dialects) */
export const connection = new DataSource(dbConfig);

export async function testConnection(connection: DataSource, logger?: Logger | LoggerInterface | Console): Promise<boolean> {
	try {
		await connection.initialize().then(() => {
			logger?.info(`Database '${dbConfig.database}' connection is initialized successfully`);
			return connection.isInitialized;
		});

		return false;
	}
	catch (error) {
		logger?.warn('Unable to connect to the database:');
		logger?.error(error);
		return false;
	}
}

export async function syncConnection(connection: DataSource, logger?: Logger | LoggerInterface | Console): Promise<void> {
	try {
		await connection.synchronize(false).then(() => {
			logger?.debug(`Database synced: ${dbConfig.database}`);
		});
	}
	catch (error) {
		logger?.warn('Unable to sync to the database:');
		logger?.error(error);
	}
}

export const DATABASE_CONNECTION_PROVIDER = Symbol('DatabaseConnectionProvider');

const databaseConnectionProvider: Provider = {
	provide: DATABASE_CONNECTION_PROVIDER,
	scope: Scope.DEFAULT,

	inject: [
		LoggerService,
	],
	useFactory: async (
		logger: LoggerService,
		...args: any[]
	): Promise<DataSource> => {
		const connection = new DataSource(dbConfig);
		logger.setContextName('DatabaseConnectionProvider');

		const isInitialized = await testConnection(connection, logger);

		if (isInitialized)
			return connection;
		return await connection.initialize();
	},
	/*
			? Provider Use Options
		* useClass
		* useFactory
		* useValue
		* useExisting
	*/

	durable: false,
};

export default databaseConnectionProvider;
