import { Provider } from '@nestjs/common';
import { Sequelize } from 'sequelize';
import { Logger } from 'winston';
import { config as DBConfig } from './db.config';


/* connecting to a database */
/* passing Parameters separately (other dialects) */
export const connection = new Sequelize(DBConfig);
/* passing a connection URI - example for postgres */
// const connection = new Sequelize('postgres://user:pass@example.com:5432/dbname')

export async function testConnection(connection: Sequelize, logger?: Logger): Promise<boolean> {
	try {
		await connection.authenticate({
			logging: false,
		});
		logger?.info('Database connection has been established successfully');
		return true;
	}
	catch (error) {
		logger?.warn('Unable to connect to the database:');
		logger?.error(error);

		return false;
	}
}

export async function syncConnection(connection: Sequelize, logger?: Logger) {
	try {
		await connection.sync({ force: false, logging: false }).then(
			(value: Sequelize) => {
				logger?.info('Database synced');
			}
		);
	}
	catch (error) { }
}

export const DATABASE_CONNECTION_PROVIDER = 'DATABASE_CONNECTION';

const databaseConnectionProvider: Provider = {
	provide: DATABASE_CONNECTION_PROVIDER,
	useFactory: async (...args: unknown[]): Promise<Sequelize> => {
		const connection = new Sequelize(DBConfig);

		await syncConnection(connection, console as any);

		return connection;
	},
};

export default databaseConnectionProvider;
