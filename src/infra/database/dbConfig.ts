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
	database: string, // database name
	username: string, // database username
	password: string, // database password
	host: string, // database host
	port: number, // database port
	dialect: Dialect, // one of 'mysql' | 'mariadb' | 'postgres' | 'mssql'
	charset?: string, // database charset encoding
	dialectOptions?: {
		ssl?: {
			rejectUnauthorized?: boolean, // to use SSL protocol (in production)
		}
	},
	define?: {
		underscored?: boolean, // to force underscore on name of fields
		timestamps?: boolean, // to createdAt and updatedAt
		paranoid?: boolean, // to deletedAt
		freezeTableName?: boolean, // to set table names on plural
	},
	logging?: boolean | ((msg?: any) => void), // enable queries logger
	options?: Options | undefined,
	buildOptions?: BuildOptions | undefined,
}

const config: DatabaseConfigInterface = {
	...configs.database,
	dialect: getDialect(`${configs.database.dialect}`),
	port: parseInt(configs.database.port),
	logging: configs.database.logging === 'true' ? console.log : false,
};


export default config;
