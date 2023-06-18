import { Model, DataTypes, Association, HasOneGetAssociationMixin, HasManyHasAssociationMixin } from 'sequelize';
import UserPreferences from './UserPreferences';
import connection from '@infra/database/connection';


class Users extends Model {
	// * ------ Attributes ------
	private id!: number;
	public fullName!: string;
	private email!: string;
	private password!: string;
	private phone!: string;
	public docType!: string;
	private document!: string;
	public fu!: string;
	public readonly createdAt!: Date;
	public updatedAt!: Date | null;
	public deletedAt!: Date | null;
	private deletedBy!: string | null;

	/**
	 * ?    Association Method
	 * @belongsTo - One-to-One, source -> target
	 * @hasOne - One-to-One, target -> source
	 * @hasMany - One-to-Many, target -> source
	 * @belongsToMany - Many-to-Many, source -> target
	**/
	static associate() {
		this.hasOne(
			UserPreferences,
			{
				constraints: true,
				foreignKeyConstraint: true,
				foreignKey: 'userId',
				sourceKey: 'id',
				as: 'preference',
			}
		);
	}

	// // ------ Association Attribute ------
	public static associations: {
		preference: Association<UserPreferences>,
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
		createdAt: DataTypes.DATE,
		updatedAt: DataTypes.DATE,
		deletedAt: DataTypes.DATE,
		deletedBy: DataTypes.STRING(256),
	},
	{
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
	}
);


export default Users;
