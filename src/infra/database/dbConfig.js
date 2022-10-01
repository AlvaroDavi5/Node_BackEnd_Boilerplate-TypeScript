const globals_variables = require("../config/constants/modifiable")
const staticDotenv = require("../config/constants/staticDotenv")


const config = {
	database: staticDotenv.db.database,
	username: staticDotenv.db.username,
	password: staticDotenv.db.password,
	host: globals_variables.db.host,
	charset: 'utf8',
	dialect: staticDotenv.db.dialect,
	/*
	dialectOptions: {
		ssl: {
			rejectUnauthorized: false
		}
	}
	*/
	port: process.env.DB_PORT,
	define: {
		underscored: true,
		timestamps: true,
		freezeTableName: false
	}
}


module.exports = config
