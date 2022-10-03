import { Model, DataTypes, Association, HasOneGetAssociationMixin, HasManyHasAssociationMixin } from 'sequelize';
import Users from './users';
import connection from '../connection';


class UserPreferences extends Model {

	// * ------ Attributes ------
	public id!: number;
	public userId!: number;
	public imagePath!: string;
	public defaultTheme!: number;
	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;

	// ? ------ Methods ------
	public getUser!: HasOneGetAssociationMixin<Users>;
	public hasUser!: HasManyHasAssociationMixin<Users, number>;
	/// / ------ Association Method ------
	public static associations: {
		user: Association<Users>
	};
}

// ! ------ Class Constructor Method ------
UserPreferences.init(
	{
		userId: DataTypes.INTEGER,
		imagePath: DataTypes.STRING(255),
		defaultTheme: DataTypes.INTEGER
	},
	{
		modelName: 'userPreferences',
		tableName: 'userPreferences',
		sequelize: connection
	}
);


export default UserPreferences;
