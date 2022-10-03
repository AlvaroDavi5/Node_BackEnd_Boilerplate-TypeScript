import { Model, DataTypes, Association, HasOneGetAssociationMixin, HasManyHasAssociationMixin } from 'sequelize';
import UserPreferences from './userPreferences';
import connection from '../connection';


// EcmaScript 6 format
class Users extends Model {

	// * ------ Attributes ------
	public id!: number;
	public fullName!: string;
	public email!: string;
	public password!: string;
	public phone!: string;
	public docType!: string;
	public document!: string;
	public fu!: string;
	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;

	// // ------ Association Method ------
	public static associations: {
		preference: Association<UserPreferences>
	};

	// ? ------ Methods ------
	public getPreference!: HasOneGetAssociationMixin<UserPreferences>;
	public hasPreference!: HasManyHasAssociationMixin<UserPreferences, number>;
}

// ! ------ Class Constructor Method ------
Users.init(
	{
		fullName: DataTypes.STRING(100),
		email: DataTypes.STRING(70),
		password: DataTypes.STRING(60),
		phone: DataTypes.STRING(16),
		docType: DataTypes.STRING(10),
		document: DataTypes.STRING(18),
		fu: DataTypes.STRING(2),
	},
	{
		modelName: 'users',
		tableName: 'users',
		scopes: {
			withoutPassword: {
				attributes: {
					exclude: ['password'],
				}
			},
			withoutSensibleData: {
				attributes: {
					exclude: ['email', 'password', 'phone', 'docType', 'document'],
				},
			}
		},
		sequelize: connection,
	}
);


export default Users;
