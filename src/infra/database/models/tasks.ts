import { Model, DataTypes, Association, HasOneGetAssociationMixin, HasManyHasAssociationMixin } from 'sequelize'
import Users from "./users"
import connection from "../connection"


class Tasks extends Model {

	// * ------ Attributes ------
	public id!: number
	public user_id!: number
	public name!: string
	public deadline_date!: Date
	public deadline_time!: Date
	public description!: string
	public readonly created_at!: Date
	public readonly updated_at!: Date

	// ? ------ Methods ------
	public getUser!: HasOneGetAssociationMixin<Users>
	public hasUser!: HasManyHasAssociationMixin<Users, number>
	//// ------ Association Method ------
	public static associations: {
		user: Association<Tasks, Users>
	}
}

// ! ------ Class Constructor Method ------
Tasks.init(
	{
		user_id: DataTypes.INTEGER,
		name: DataTypes.STRING(100),
		deadline_date: DataTypes.DATE,
		deadline_time: DataTypes.TIME,
		description: DataTypes.STRING(355)
	},
	{
		modelName: 'Tasks',
		tableName: 'tasks',
		sequelize: connection
	}
)


export default Tasks
