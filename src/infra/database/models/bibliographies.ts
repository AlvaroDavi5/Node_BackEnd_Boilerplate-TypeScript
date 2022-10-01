import { Model, DataTypes, Association, HasOneGetAssociationMixin, HasManyHasAssociationMixin } from 'sequelize'
import Users from "./users"
import connection from "../connection"


class Bibliographies extends Model {

	// * ------ Attributes ------
	public id!: number
	public user_id!: number
	public author!: string
	public name!: string
	public publication_date!: Date
	public readonly created_at!: Date
	public readonly updated_at!: Date

	// ? ------ Methods ------
	public getUser!: HasOneGetAssociationMixin<Users>
	public hasUser!: HasManyHasAssociationMixin<Users, number>
	//// ------ Association Method ------
	public static associations: {
		user: Association<Bibliographies, Users>
	}
}

// ! ------ Class Constructor Method ------
Bibliographies.init(
	{
		user_id: DataTypes.INTEGER,
		author: DataTypes.STRING(85),
		name: DataTypes.STRING(325),
		publication_date: DataTypes.DATE
	},
	{
		modelName: 'Bibliographies',
		tableName: 'bibliographies',
		sequelize: connection
	}
)


export default Bibliographies
