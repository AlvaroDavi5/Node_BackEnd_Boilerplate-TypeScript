import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne } from 'typeorm';
import UsersModel from './Users.model';


@Entity({
	name: 'UserPreferences',
	comment: 'User Preferences data structure',
	synchronize: true,
})
export default class UserPreferencesModel extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	public id!: string;

	@Column({
		name: 'imagePath',
		type: 'varchar',
		length: 260,
		nullable: true,
		default: null,
		comment: 'User profile image path',
	})
	public imagePath!: string | null;

	@Column({
		name: 'document',
		type: 'varchar',
		length: 20,
		nullable: true,
		default: null,
		comment: 'User default theme',
	})
	public defaultTheme!: string | null;

	@Column({
		name: 'createdAt',
		type: 'date',
		nullable: false,
		default: 'NOW()',
		comment: 'User creation timestamp',
	})
	public readonly createdAt!: Date;

	@Column({
		name: 'updatedAt',
		type: 'date',
		nullable: true,
		default: null,
		comment: 'User updated timestamp',
	})
	public updatedAt!: Date | null;

	@Column({
		name: 'deletedAt',
		type: 'date',
		nullable: true,
		default: null,
		comment: 'User deleted timestamp',
	})
	public deletedAt!: Date | null;

	@OneToOne(() => UsersModel, (user: UsersModel) => user.preference, {
		createForeignKeyConstraints: true,
		nullable: true,
		onUpdate: 'CASCADE',
		onDelete: 'CASCADE',
	})
	@JoinColumn({
		name: 'userId',
		foreignKeyConstraintName: 'userId',
		referencedColumnName: 'id',
	})
	public user!: UsersModel | null;

	/**
		@param name: 'userId'
		@param foreignKeyConstraintName: 'userId'
		@param type: 'uuid'
		@param length: 260
		@param nullable: true
		@param default: ''
		@param comment: 'User ID'
	**/
	public userId!: string | null;
}
