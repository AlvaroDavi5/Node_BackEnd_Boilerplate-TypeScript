import { Sequelize } from 'sequelize';
import DBConfig from 'configs/dbConfig';


/* connecting to a database */
/* passing Parameters separately (other dialects) */
const connection = new Sequelize(DBConfig);
/* passing a connection URI - example for postgres */
// const sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname')


/* testing the connection */
try {
	connection.authenticate();
	console.log('Database connection has been established successfully.');
}
catch (error) {
	console.error('Unable to connect to the database: ', error);
}


/* closing connection */
// connection.close()


export default connection;
