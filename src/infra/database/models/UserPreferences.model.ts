import { Model, DataTypes, Association, HasOneGetAssociationMixin, HasManyHasAssociationMixin } from 'sequelize';
import Users from './Users.model';
import connection from '@infra/database/connection';


class UserPreferences extends Model {
	// * ------ Attributes ------
	private id!: number;
	private userId!: number;
	private imagePath!: string;
	public defaultTheme!: string;
	public readonly createdAt!: Date;
	public updatedAt!: Date | null;
	public deletedAt!: Date | null;

	/**
	 * ?    Association Method
	 * @belongsTo - One-to-One, source -> target
	 * @hasOne - One-to-One, target -> source
	 * @hasMany - One-to-Many, target -> source
	 * @belongsToMany - Many-to-Many, source -> target
	**/
	static associate() {
		this.belongsTo(
			Users,
			{
				constraints: true,
				foreignKeyConstraint: true,
				foreignKey: 'userId',
				targetKey: 'id',
				as: 'user',
			}
		);
	}

	// // ------ Association Attribute ------
	public static associations: {
		user: Association<Users>
	};

	// ? ------ Methods ------
	public getUser!: HasOneGetAssociationMixin<Users>;
	public hasUser!: HasManyHasAssociationMixin<Users, number>;
}

// ! ------ Class Constructor Method ------
UserPreferences.init(
	{
		userId: DataTypes.INTEGER,
		imagePath: DataTypes.STRING(255),
		defaultTheme: DataTypes.STRING(20),
		createdAt: DataTypes.DATE,
		updatedAt: DataTypes.DATE,
		deletedAt: DataTypes.DATE,
	},
	{
		modelName: 'UserPreferences',
		tableName: 'UserPreferences',
		sequelize: connection
	}
);


export default UserPreferences;