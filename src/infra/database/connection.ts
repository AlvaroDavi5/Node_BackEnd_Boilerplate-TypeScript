import { Sequelize } from 'sequelize';
import DBConfig from './dbConfig';


/* connecting to a database */
/* passing Parameters separately (other dialects) */
const connection = new Sequelize(DBConfig);
/* passing a connection URI - example for postgres */
// const sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname')


export async function testConnection(connection: Sequelize, logger?: any): Promise<boolean> {
	try {
		await connection.authenticate({
			logging: false,
		});
		logger.info('Database connection has been established successfully.');
		return true;
	}
	catch (error: any) {
		logger.error('Unable to connect to the database: ', error);
		logger.warn('Closing Connection.');
		await connection.close();
		return false;
	}
}

export async function syncConnection(connection: Sequelize, logger?: any) {
	/* drop all tables and recreate them */
	await connection.sync({ force: true, logging: false }).then(
		(value: Sequelize) => {
			logger.info('Database synced.');
		}
	);
}

export default connection;
