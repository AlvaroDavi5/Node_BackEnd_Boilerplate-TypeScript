import { Options, BuildOptions, Dialect } from 'sequelize/types';
import configs from 'configs/configs';


function getDialect(dialect: string): Dialect {
	switch (dialect.toLowerCase()) {
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

const config: DatabaseConfigInterface = {
	...configs.database,
	dialect: getDialect(`${configs.database.dialect}`),
	port: parseInt(configs.database.port),
	logging: configs.application.logging === 'true' ? console.log : false,
};


export default config;
