
module.exports = {
	database: process.env.DB_NAME,
	username: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	host: process.env.DB_HOST,
	charset: "utf8",
	dialect: process.env.DB_DBMS_NAME,
	port: process.env.DB_PORT,
	define: {
		underscored: false,
		timestamps: true,
		freezeTableName: false
	}
};
