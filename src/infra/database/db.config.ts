import { Options, BuildOptions, Dialect } from 'sequelize/types';


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
	database: process.env.DB_NAME || 'db_postgres',
	username: process.env.DB_USERNAME || 'postgres',
	password: process.env.DB_PASSWORD || 'pass',
	host: process.env.DB_HOST || 'localhost',
	charset: 'utf8',
	dialect: getDialect(process.env.DB_DBMS_NAME || 'postgres'),
	port: parseInt(process.env.DB_PORT || '5432'),
	define: {
		underscored: false,
		timestamps: true,
		paranoid: true,
		freezeTableName: false,
	},
	pool: {
		min: 0,
		max: 5,
		acquire: 20000,
		idle: 20000,
	},
	logging: process.env.SHOW_LOGS === 'true' ? console.log : false,
};

export default config;
