import { Sequelize } from 'sequelize';
import { Logger } from 'winston';
import DBConfig from './db.config';


/* connecting to a database */
/* passing Parameters separately (other dialects) */
const connection = new Sequelize(DBConfig);
/* passing a connection URI - example for postgres */
// const sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname')


export async function testConnection(connection: Sequelize, logger?: Logger): Promise<boolean> {
	try {
		await connection.authenticate({
			logging: false,
		});
		logger?.info('Database connection has been established successfully.');
		return true;
	}
	catch (error: unknown) {
		logger?.warn('Unable to connect to the database:');
		logger?.error(error);

		return false;
	}
}

export async function syncConnection(connection: Sequelize, logger?: Logger) {
	try {
		/* drop all tables and recreate them */
		await connection.sync({ force: true, logging: false }).then(
			(value: Sequelize) => {
				logger?.info('Database synced.');
			}
		);
	}
	catch (error: unknown) { }
}

export default connection;
