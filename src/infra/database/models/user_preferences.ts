import { Model, DataTypes, Association, HasOneGetAssociationMixin, HasManyHasAssociationMixin } from 'sequelize'
import Users from "./users"
import connection from "../connection"


class UserPreferences extends Model {

	// * ------ Attributes ------
	public id!: number
	public user_id!: number
	public image_path!: string
	public default_theme!: number
	public readonly created_at!: Date
	public readonly updated_at!: Date

	// ? ------ Methods ------
	public getUser!: HasOneGetAssociationMixin<Users>
	public hasUser!: HasManyHasAssociationMixin<Users, number>
	//// ------ Association Method ------
	public static associations: {
		user: Association<UserPreferences, Users>
	}
}

// ! ------ Class Constructor Method ------
UserPreferences.init(
	{
		user_id: DataTypes.INTEGER,
		image_path: DataTypes.STRING(255),
		default_theme: DataTypes.INTEGER
	},
	{
		modelName: 'UserPreferences',
		tableName: 'user_preferences',
		sequelize: connection
	}
)


export default UserPreferences
