import { Options, BuildOptions, Dialect } from 'sequelize/types';
import configs from '@core/configs/configs.config';


function getDialect(dialect: string | undefined): Dialect {
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

export interface DatabaseConfigInterface {
	database: string,
	username: string,
	password: string,
	host: string,
	port: number,
	dialect: Dialect,
	charset?: string,
	dialectOptions?: {
		ssl?: {
			rejectUnauthorized?: boolean,
		}
	},
	define?: {
		underscored?: boolean,
		timestamps?: boolean,
		paranoid?: boolean,
		freezeTableName?: boolean,
	},
	pool?: {
		min?: number,
		max?: number,
		acquire?: number,
		idle?: number,
	},
	logging?: boolean | ((msg: string) => void),
	options?: Options | undefined,
	buildOptions?: BuildOptions | undefined,
}

const { application: app, database: db } = configs();

export const config: DatabaseConfigInterface = {
	database: db.database,
	username: db.username,
	password: db.password,
	host: db.host,
	charset: db.charset,
	dialect: getDialect(db.dialect),
	port: parseInt(db.port),
	define: { ...db.define },
	pool: { ...db.pool },
	logging: app.logging === 'true' ? console.log : false,
};
