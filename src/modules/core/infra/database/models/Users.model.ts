import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToOne } from 'typeorm';
import UserPreferencesModel from './UserPreferences.model';


@Entity({
	name: 'Users',
	comment: 'Users data structure',
	synchronize: true,
})
export default class UsersModel extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	public id!: string;

	@Column({
		name: 'fullName',
		type: 'varchar',
		length: 100,
		nullable: false,
		default: '',
		comment: 'User name',
	})
	public fullName!: string;

	@Column({
		name: 'email',
		type: 'varchar',
		length: 70,
		unique: true,
		nullable: false,
		default: '',
		comment: 'User email',
	})
	public email!: string;

	@Column({
		name: 'password',
		type: 'varchar',
		length: 550,
		nullable: false,
		default: '',
		select: false,
		comment: 'User password',
	})
	public password!: string;

	@Column({
		name: 'phone',
		type: 'varchar',
		length: 16,
		nullable: true,
		default: null,
		select: false,
		comment: 'User phone number',
	})
	public phone!: string | null;

	@Column({
		name: 'docType',
		type: 'varchar',
		length: 10,
		nullable: true,
		default: null,
		comment: 'Document type',
	})
	public docType!: string | null;

	@Column({
		name: 'document',
		type: 'varchar',
		length: 18,
		nullable: true,
		default: null,
		select: false,
		comment: 'Document code',
	})
	public document!: string | null;

	@Column({
		name: 'fu',
		type: 'varchar',
		length: 2,
		nullable: true,
		default: null,
		comment: 'Brazilian Federative Unity',
	})
	public fu!: string | null;

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

	@Column({
		name: 'deletedBy',
		type: 'varchar',
		length: 260,
		nullable: true,
		default: null,
		comment: 'Deleted by agentUser',
	})
	public deletedBy!: string | null;

	@OneToOne(() => UserPreferencesModel, (preference: UserPreferencesModel) => preference.user, {
		createForeignKeyConstraints: true,
		nullable: true,
		onUpdate: 'CASCADE',
		onDelete: 'CASCADE',
	})
	public preference!: UserPreferencesModel | null;
}
