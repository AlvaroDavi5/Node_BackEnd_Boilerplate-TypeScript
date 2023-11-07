import { Model, DataTypes, Association, HasOneGetAssociationMixin, HasManyHasAssociationMixin } from 'sequelize';
import UsersModel from './Users.model';
import connection from '@core/infra/database/connection';


class UserPreferencesModel extends Model {
	protected id!: number;
	protected userId!: number;
	protected imagePath!: string;
	public defaultTheme!: string;
	public readonly createdAt!: Date;
	public updatedAt!: Date | null;
	public deletedAt!: Date | null;

	static associate() {
		this.belongsTo(
			UsersModel,
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
		user: Association<UsersModel>
	};

	public getUser!: HasOneGetAssociationMixin<UsersModel>;
	public hasUser!: HasManyHasAssociationMixin<UsersModel, number>;
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

UserPreferencesModel.init(userPreferenceAttributes, userPreferenceOptions);

export default UserPreferencesModel;
