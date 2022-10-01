import { Dialect } from 'sequelize/types'
import path from 'path'
import dotenv from 'dotenv' // use environment variables to save sesitive data like database password
dotenv.config({path:__dirname+"/../.env.development.local"})
import { DatabaseConfig } from "./_interfaces"


function getDialect(dialect: string): Dialect {
	switch (dialect.toLowerCase()) {
		case "mysql":
			return 'mysql'
		case "postgres":
			return 'postgres'
		case "sqlite":
			return 'sqlite'
		case "mssql":
			return 'mssql'
		default:
			return 'mysql'
	}
}

const config: DatabaseConfig = {
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
		underscored: true, // underscored name of fields
		timestamps: true, // to created_at and updated_at
		freezeTableName: false // not set table names on plural
	}
}


export default config
