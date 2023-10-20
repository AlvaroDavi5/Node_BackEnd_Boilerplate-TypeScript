import { Model, DataTypes, Association, HasOneGetAssociationMixin, HasManyHasAssociationMixin } from 'sequelize';
import Users from './Users.model';
import connection from '@core/infra/database/connection';


class UserPreferences extends Model {
	protected id!: number;
	protected userId!: number;
	protected imagePath!: string;
	public defaultTheme!: string;
	public readonly createdAt!: Date;
	public updatedAt!: Date | null;
	public deletedAt!: Date | null;

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

	public static associations: {
		user: Association<Users>
	};

	public getUser!: HasOneGetAssociationMixin<Users>;
	public hasUser!: HasManyHasAssociationMixin<Users, number>;
}

export const userPreferenceAttributes = {
	userId: DataTypes.INTEGER,
	imagePath: DataTypes.STRING(255),
	defaultTheme: DataTypes.STRING(20),
	createdAt: DataTypes.DATE,
	updatedAt: DataTypes.DATE,
	deletedAt: DataTypes.DATE,
};

export const userPreferenceOptions = {
	modelName: 'UserPreferences',
	tableName: 'UserPreferences',
	sequelize: connection
};

UserPreferences.init(userPreferenceAttributes, userPreferenceOptions);

export default UserPreferences;
