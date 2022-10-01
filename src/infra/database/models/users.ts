import { Model, DataTypes, Association, HasOneGetAssociationMixin, HasManyGetAssociationsMixin, HasManyHasAssociationMixin } from 'sequelize'
import UserPreferences from "./user_preferences"
import Projects from "./projects"
import Tasks from "./tasks"
import Bibliographies from "./bibliographies"
import connection from "../connection"


// EcmaScript 6 format
class Users extends Model {

	// * ------ Attributes ------
	public id!: number
	public name!: string
	public email!: string
	public password!: string
	public phone!: string
	public cpf!: string
	public uf!: string
	public readonly created_at!: Date
	public readonly updated_at!: Date

	// ? ------ Methods ------
	public getPreference!: HasOneGetAssociationMixin<UserPreferences>
	public hasPreference!: HasManyHasAssociationMixin<UserPreferences, number>
	public getProjects!: HasManyGetAssociationsMixin<Projects>
	public hasProject!: HasManyHasAssociationMixin<Projects, number>
	public getTasks!: HasManyGetAssociationsMixin<Tasks>
	public hasTask!: HasManyHasAssociationMixin<Tasks, number>
	public getBibliographies!: HasManyGetAssociationsMixin<Bibliographies>
	public hasBibliography!: HasManyHasAssociationMixin<Bibliographies, number>
	//// ------ Association Method ------
	public static associations: {
		preference: Association<Users, UserPreferences>
		Projects: Association<Users, Projects>
		tasks: Association<Users, Tasks>
		bibliographies: Association<Users, Bibliographies>
	}
}

// ! ------ Class Constructor Method ------
Users.init(
	{
		name: DataTypes.STRING(85),
		email: DataTypes.STRING(60),
		password: DataTypes.STRING(65),
		phone: DataTypes.STRING(14),
		cpf: DataTypes.STRING(18),
		uf: DataTypes.STRING(2)
	},
	{
		modelName: 'Users',
		tableName: 'users',
		scopes: {
			withoutPassword: {
				attributes: {
					exclude: ['password']
				}
			},
			withoutSensibleData: {
				attributes: {
					exclude: ['email', 'password', 'phone', 'cpf']
				},
			}
		},
		sequelize: connection
	}
)


export default Users
