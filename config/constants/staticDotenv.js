const path = require('path')
const dotenv = require('dotenv')
dotenv.config({path:__dirname+"/../../env/.env.development.local"})


const staticDotenv = {
	db: {
		database: process.env.DB_NAME,
		username: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
		dialect: process.env.DB_DBMS_NAME,
		port: process.env.DB_PORT
	},
	secure: {
		secret_key: process.env.CRYPTO_KEY,
		crypto_algorithm: process.env.CRYPTO_ALGORITHM
	},
	general: {
		app_name: process.env.APP_NAME,
		node_env: process.env.NODE_ENV
	}
}


module.exports = staticDotenv
