import connection from "./connection"
import Users from "./models/users"
import UserPreferences from "./models/user_preferences"
import Projects from "./models/projects"
import ProjTasks from "./models/proj_tasks"
import Tasks from "./models/tasks"
import Bibliographies from "./models/bibliographies"


// ! saving models
const models = {
	Users,
	UserPreferences,
	Projects,
	ProjTasks,
	Tasks,
	Bibliographies
}

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
		foreignKey: 'user_id',
		sourceKey: 'id',
		as: 'preference'
	}
)
Users.hasMany(
	models.Projects,
	{
		constraints: true,
		foreignKeyConstraint: true,
		foreignKey: 'user_id',
		sourceKey: 'id',
		as: 'projects'
	}
)
Users.hasMany(
	models.Tasks,
	{
		constraints: true,
		foreignKeyConstraint: true,
		foreignKey: 'user_id',
		sourceKey: 'id',
		as: 'tasks'
	}
)
Users.hasMany(
	models.Bibliographies,
	{
		constraints: true,
		foreignKeyConstraint: true,
		foreignKey: 'user_id',
		sourceKey: 'id',
		as: 'bibliographies'
	}
)

UserPreferences.belongsTo(
	models.Users,
	{
		constraints: true,
		foreignKeyConstraint: true,
		foreignKey: 'user_id',
		targetKey: 'id',
		as: 'user'
	}
)

Projects.belongsTo(
	models.Users,
	{
		foreignKey: 'user_id',
		targetKey: 'id',
		as: 'user'
	}
)
Projects.hasMany(
	models.ProjTasks,
	{
		foreignKey: 'proj_id',
		sourceKey: 'id',
		as: 'proj_tasks'
	}
)

ProjTasks.belongsTo(
	models.Projects,
	{
		foreignKey: 'proj_id',
		targetKey: 'id',
		as: 'project'
	}
)

Tasks.belongsTo(
	models.Users,
	{
		foreignKey: 'user_id',
		targetKey: 'id',
		as: 'user'
	}
)

Bibliographies.belongsTo(
	models.Users,
	{
		constraints: true,
		foreignKeyConstraint: true,
		foreignKey: 'user_id',
		targetKey: 'id',
		as: 'user'
	}
)


// * drop all tables and recreate them
connection.sync({ force: true }).then(
  () => {
    console.log("Database synced")
  }
)


export default connection
