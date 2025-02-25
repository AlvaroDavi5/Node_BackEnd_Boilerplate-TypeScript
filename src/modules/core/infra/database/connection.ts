import 'reflect-metadata';
import { Provider, Scope } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Logger } from 'winston';
import LoggerService from '@core/logging/Logger.service';
import { dbConfig } from './db.config';


export async function testConnection(connection: DataSource, logger?: Logger | LoggerService | Console): Promise<boolean> {
	try {
		await connection.query('select version()').then(() => {
			logger?.info(`Database connection with '${dbConfig.database}' is already established`);
		});
		return true;
	} catch (error) {
		logger?.warn('Unable to connect to the database:');
		logger?.error(error);
		return false;
	}
}

export async function startConnection(connection: DataSource, logger?: Logger | LoggerService | Console): Promise<void> {
	try {
		await connection.initialize().then(() => {
			logger?.info(`Database connection with '${dbConfig.database}' is initialized successfully`);
		});
	} catch (error) {
		logger?.warn('Unable to initialize the database connection:');
		logger?.error(error);
	}
}

export async function syncConnection(connection: DataSource, logger?: Logger | LoggerService | Console): Promise<void> {
	try {
		await connection.synchronize(false).then(() => {
			logger?.debug(`Database synced: ${dbConfig.database}`);
		});
	} catch (error) {
		logger?.warn('Unable to sync the database:');
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
		..._args: unknown[]
	): Promise<DataSource> => {
		const connection = new DataSource(dbConfig);
		logger.setContextName('DatabaseConnectionProvider');

		try {
			const isInitialized = await testConnection(connection);

			if (isInitialized)
				return connection;
			return await connection.initialize();
		} catch (error) {
			logger.error(error);
			throw error;
		}
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
