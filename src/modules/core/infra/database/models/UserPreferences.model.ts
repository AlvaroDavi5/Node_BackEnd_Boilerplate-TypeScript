import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToOne } from 'typeorm';
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
		name: 'defaultTheme',
		type: 'varchar',
		length: 20,
		nullable: true,
		default: null,
		comment: 'User default theme',
	})
	public defaultTheme!: string | null;

	@CreateDateColumn({
		name: 'createdAt',
		type: 'timestamp without time zone',
		nullable: false,
		default: 'NOW()',
		comment: 'User creation timestamp',
	})
	public readonly createdAt!: Date;

	@UpdateDateColumn({
		name: 'updatedAt',
		type: 'timestamp without time zone',
		nullable: false,
		default: 'NOW()',
		comment: 'User updated timestamp',
	})
	public updatedAt!: Date;

	@DeleteDateColumn({
		name: 'deletedAt',
		type: 'timestamp without time zone',
		nullable: true,
		default: null,
		comment: 'User deleted timestamp',
	})
	public deletedAt!: Date | null;

	@OneToOne(() => UsersModel, (user: UsersModel) => user.preference, {
		createForeignKeyConstraints: true,
		nullable: true,
		onUpdate: 'NO ACTION',
		onDelete: 'NO ACTION',
	})
	@JoinColumn({
		name: 'userId',
		referencedColumnName: 'id',
	})
	public user!: UsersModel | null;

	/**
		@param name: 'userId'
		@param foreignKeyConstraintName: 'user_id'
		@param type: 'uuid'
		@param length: 260
		@param nullable: true
		@param default: ''
		@param comment: 'User ID'
	**/
	// // public userId!: string | null;
}
