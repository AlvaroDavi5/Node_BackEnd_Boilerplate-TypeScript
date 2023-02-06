import { Sequelize } from 'sequelize';
import DBConfig from './dbConfig';


/* connecting to a database */
/* passing Parameters separately (other dialects) */
const connection = new Sequelize(DBConfig);
/* passing a connection URI - example for postgres */
// const sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname')


export async function testConnection(connection: Sequelize): Promise<boolean> {
	try {
		await connection.authenticate();
		console.log('Database connection has been established successfully.');
		return true;
	}
	catch (error: any) {
		console.error('Unable to connect to the database: ', error);
		console.warn('Closing Connection.');
		await connection.close();
		return false;
	}
}

export async function syncConnection(connection: Sequelize) {
	/* drop all tables and recreate them */
	await connection.sync({ force: true }).then(
		(value: Sequelize) => {
			console.info('Database synced.');
		}
	);
}

export default connection;
