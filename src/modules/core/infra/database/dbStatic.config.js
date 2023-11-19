
module.exports = {
	database: process.env.DB_NAME || 'db_postgres',
	username: process.env.DB_USERNAME || 'postgres',
	password: process.env.DB_PASSWORD || 'pass',
	host: process.env.DB_HOST || 'localhost',
	charset: 'utf8',
	dialect: process.env.DB_DBMS_NAME || 'postgres',
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
