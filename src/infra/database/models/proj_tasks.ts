import { Model, DataTypes, Association, HasOneGetAssociationMixin, HasManyHasAssociationMixin } from 'sequelize'
import Projects from "./projects"
import connection from "../connection"


class ProjTasks extends Model {

	// * ------ Attributes ------
	public id!: number
	public proj_id!: number
	public task_num!: number
	public name!: string
	public description!: string
	public deadline!: Date
	public situation!: number
	public was_finished!: boolean
	public readonly created_at!: Date
	public readonly updated_at!: Date

	// ? ------ Methods ------
	public getProject!: HasOneGetAssociationMixin<Projects>
	public hasProject!: HasManyHasAssociationMixin<Projects, number>
	//// ------ Association Method ------
	public static associations: {
		project: Association<ProjTasks, Projects>
	}
}

// ! ------ Class Constructor Method ------
ProjTasks.init(
	{
		proj_id: DataTypes.INTEGER,
		task_num: DataTypes.INTEGER,
		name: DataTypes.STRING(100),
		description: DataTypes.STRING(355),
		deadline: DataTypes.DATE,
		situation: DataTypes.INTEGER,
		was_finished: DataTypes.BOOLEAN
	},
	{
		modelName: 'ProjTasks',
		tableName: 'proj_tasks',
		sequelize: connection
	}
)


export default ProjTasks
