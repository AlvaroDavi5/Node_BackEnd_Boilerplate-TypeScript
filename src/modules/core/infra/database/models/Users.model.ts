import { Model, DataTypes, Association, HasOneGetAssociationMixin, HasManyHasAssociationMixin } from 'sequelize';
import UserPreferencesModel from './UserPreferences.model';
import connection from '@core/infra/database/connection';


class UsersModel extends Model {
	protected id!: number;
	public fullName!: string;
	protected email!: string;
	protected password!: string;
	protected phone!: string;
	public docType!: string;
	protected document!: string;
	public fu!: string;
	public readonly createdAt!: Date;
	public updatedAt!: Date | null;
	public deletedAt!: Date | null;
	protected deletedBy!: string | null;

	static associate() {
		this.hasOne(
			UserPreferencesModel,
			{
				constraints: true,
				foreignKeyConstraint: true,
				foreignKey: 'userId',
				sourceKey: 'id',
				as: 'preference',
			}
		);
	}

	public static associations: {
		preference: Association<UserPreferencesModel>,
	};

	public getPreference!: HasOneGetAssociationMixin<UserPreferencesModel>;
	public hasPreference!: HasManyHasAssociationMixin<UserPreferencesModel, number>;
}

export const userAttributes = {
	fullName: DataTypes.STRING(100),
	email: DataTypes.STRING(70),
	password: DataTypes.STRING(60),
	phone: DataTypes.STRING(16),
	docType: DataTypes.STRING(10),
	document: DataTypes.STRING(18),
	fu: DataTypes.STRING(2),
	createdAt: DataTypes.DATE,
	updatedAt: DataTypes.DATE,
	deletedAt: DataTypes.DATE,
	deletedBy: DataTypes.STRING(256),
};
export const userOptions = {
	modelName: 'Users',
	tableName: 'Users',
	scopes: {
		withoutPassword: {
			attributes: {
				exclude: ['password'],
			}
		},
		withoutSensibleData: {
			attributes: {
				exclude: ['email', 'password', 'phone', 'document'],
			},
		}
	},
	sequelize: connection,
};

UsersModel.init(userAttributes, userOptions);

export default UsersModel;
