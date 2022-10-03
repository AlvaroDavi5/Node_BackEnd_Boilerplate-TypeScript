import connection from './connection';
import Users from './models/users';
import UserPreferences from './models/userPreferences';


// ! saving models
const models = {
	Users,
	UserPreferences,
};

/**
  * ?    Associations
  * @belongsTo - One-to-One, source -> target
  * @hasOne - One-to-One, target -> source
  * @hasMany - One-to-Many, target -> source
  * @belongsToMany - Many-to-Many, source -> target
**/
Users.hasOne(
	models.UserPreferences,
	{
		constraints: true,
		foreignKeyConstraint: true,
		foreignKey: 'userId',
		sourceKey: 'id',
		as: 'preference'
	}
);
UserPreferences.belongsTo(
	models.Users,
	{
		constraints: true,
		foreignKeyConstraint: true,
		foreignKey: 'userId',
		targetKey: 'id',
		as: 'preference'
	}
);

// * drop all tables and recreate them
connection.sync({ force: true }).then(
	() => {
		console.log('Database synced');
	}
);


export default connection;
