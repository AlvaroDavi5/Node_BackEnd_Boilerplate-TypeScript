import { DataSource, DataSourceOptions } from 'typeorm';
import envsConfig from '@core/configs/envs.config';
import UsersModel from './models/Users.model';
import UserPreferencesModel from './models/UserPreferences.model';


function getDialect(dialect: string): 'mysql' | 'postgres' | 'sqlite' | 'mssql' {
	switch (dialect?.toLowerCase()) {
		case 'mysql':
			return 'mysql';
		case 'postgres':
			return 'postgres';
		case 'sqlite':
			return 'sqlite';
		case 'mssql':
			return 'mssql';
		default:
			return 'mysql';
	}
}

const { application: app, database: db } = envsConfig();

export const dbConfig: DataSourceOptions = {
	name: 'dbConfig',
	database: db.database,
	username: db.username,
	password: db.password,
	host: db.host,
	port: parseInt(db.port, 10),
	type: getDialect(db.dialect),
	charset: db.charset,
	timezone: db.timezone,
	logging: app.showExternalLogs,
	entities: [
		UsersModel,
		UserPreferencesModel,
	],
	migrations: ['build/modules/core/infra/database/migrations/**/*.js'],
	subscribers: [],
	pool: {
		max: db.pool.max,
		min: db.pool.min,
		fifo: db.pool.fifo,
		idleTimeoutMillis: db.pool.idle,
		acquireTimeoutMillis: db.pool.acquire,
	},
	...db.define,
	synchronize: false,
};

/* connecting to a database */
/* passing Parameters separately (other dialects) */
const connection = new DataSource(dbConfig);
export default connection;
