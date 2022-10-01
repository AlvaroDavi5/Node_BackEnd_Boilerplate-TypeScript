import { Model, DataTypes, Association, HasOneGetAssociationMixin, HasManyGetAssociationsMixin, HasManyHasAssociationMixin } from 'sequelize'
import Users from "./users"
import ProjTasks from "./proj_tasks"
import connection from "../connection"


class Projects extends Model {

	// * ------ Attributes ------
	public id!: number
	public user_id!: number
	public name!: string
	public readonly created_at!: Date
	public readonly updated_at!: Date

	// ? ------ Methods ------
	public getUser!: HasOneGetAssociationMixin<Users>
	public hasUser!: HasManyHasAssociationMixin<Users, number>
	public getProjTasks!: HasManyGetAssociationsMixin<ProjTasks>
	public hasProjTask!: HasManyHasAssociationMixin<ProjTasks, number>
	//// ------ Association Method ------
	public static associations: {
		user: Association<Projects, Users>
		proj_tasks: Association<Projects, ProjTasks>
	}
}

// ! ------ Class Constructor Method ------
Projects.init(
	{
		user_id: DataTypes.INTEGER,
		name: DataTypes.STRING(100)
	},
	{
		modelName: 'Projects',
		tableName: 'projects',
		sequelize: connection
	}
)


export default Projects
