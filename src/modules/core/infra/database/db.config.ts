import { DataSourceOptions } from 'typeorm';
import configs from '@core/configs/configs.config';
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

const { application: app, database: db } = configs();

export const dbConfig: DataSourceOptions = {
	database: db.database,
	username: db.username,
	password: db.password,
	host: db.host,
	port: parseInt(db.port),
	type: getDialect(db.dialect),
	charset: db.charset,
	timezone: db.timezone,
	logging: app.logging === 'true',
	entities: [
		UsersModel,
		UserPreferencesModel,
	],
	migrations: [],
	subscribers: [],
	pool: { ...db.pool },
	...db.define,
	synchronize: false,
};
