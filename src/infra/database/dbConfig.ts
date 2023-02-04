import { Options, BuildOptions, Dialect } from 'sequelize/types';
import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: __dirname + "/../.env.development.local" });
dotenv.config();


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
	database: string | undefined,
	username: string | undefined,
	password: string | undefined,
	dialect: Dialect | undefined,
	host: string | undefined,
	port: number | undefined,
	charset?: string | undefined,
	dialectOptions?: {
		ssl: {
			rejectUnauthorized: boolean,
		}
	},
	define?: {
		underscored: boolean,
		timestamps: boolean,
		freezeTableName: boolean,
	},
	options?: Options | undefined,
	buildOptions?: BuildOptions | undefined,
}

const config: DatabaseConfigInterface = {
	database: process.env.DB_NAME, // database name
	username: process.env.DB_USERNAME, // database username
	password: process.env.DB_PASSWORD, // database password
	host: process.env.DB_HOST, // database host (change to 'db' if your connection its between docker containers or to 'localhost' if you use local machine)
	charset: 'utf8', // database charset encoding
	dialect: getDialect(`${process.env.DB_DBMS_NAME}`), // one of 'mysql' | 'mariadb' | 'postgres' | 'mssql'
	/*
	dialectOptions: {
		ssl: {
			rejectUnauthorized: false // to use SSL protocol (in production)
		}
	}
	*/
	port: parseInt(`${process.env.DB_PORT}`), // database port
	define: {
		underscored: false, // underscored name of fields
		timestamps: true, // to createdAt and updatedAt
		freezeTableName: false // not set table names on plural
	}
};


export default config;
