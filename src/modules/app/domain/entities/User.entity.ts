import { ObjectType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import AbstractEntity, { AbstractEntityList } from '@core/infra/database/entities/AbstractEntity.entity';
import UserPreferenceEntity, { UserPreferenceInterface } from './UserPreference.entity';
import { returingNumber, returingString, returingDate } from 'src/types/returnTypeFunc';


export interface UserInterface {
	id?: number,
	fullName?: string,
	email?: string,
	password?: string,
	phone?: string,
	docType?: string,
	document?: string,
	fu?: string,
	preference?: UserPreferenceInterface,
	readonly createdAt: Date,
	updatedAt?: Date,
	deletedAt?: Date,
	deletedBy?: string,
}

export const returingUserPreferenceEntity = () => UserPreferenceEntity;

@ObjectType()
export default class UserEntity extends AbstractEntity {
	@ApiProperty({ type: Number, example: 0, default: 0, nullable: false, required: false, description: 'Database register ID' })
	@Field(returingNumber, { defaultValue: 0, nullable: false, description: 'Database register ID' })
	@IsNumber()
	private id = 0;

	@ApiProperty({ type: String, example: 'User Default', default: null, nullable: true, required: true, description: 'User name' })
	@Field(returingString, { defaultValue: null, nullable: true, description: 'User name' })
	@IsString()
	public fullName: string | null = null;

	@ApiProperty({ type: String, example: 'user.default@nomail.dev', default: null, nullable: true, required: true, description: 'User email' })
	@Field(returingString, { defaultValue: null, nullable: true, description: 'User email' })
	@IsString()
	private email: string | null = null;

	@ApiProperty({ type: String, example: 'cGFzczEyMw==', default: null, nullable: true, required: true, description: 'User password' })
	@Field(returingString, { defaultValue: null, nullable: true, description: 'User password' })
	@IsString()
	private password: string | null = null;

	@ApiProperty({ type: String, example: '+0000000000000', default: null, nullable: true, required: true, description: 'User phone number' })
	@Field(returingString, { defaultValue: null, nullable: true, description: 'User phone number' })
	@IsString()
	private phone: string | null = null;

	@ApiProperty({ type: String, example: 'INVALID', default: null, nullable: true, required: true, description: 'Document type' })
	@Field(returingString, { defaultValue: null, nullable: true, description: 'Document type' })
	@IsString()
	public docType: string | null = null;

	@ApiProperty({ type: String, example: '00000000000', default: null, nullable: true, required: true, description: 'Document code' })
	@Field(returingString, { defaultValue: null, nullable: true, description: 'Document code' })
	@IsString()
	private document: string | null = null;

	@ApiProperty({ type: String, example: 'UF', default: null, nullable: true, required: true, description: 'Brazilian Federative Unity' })
	@Field(returingString, { defaultValue: null, nullable: true, description: 'Brazilian Federative Unity' })
	@IsString()
	public fu: string | null = null;

	@ApiProperty({
		type: UserPreferenceEntity, example: (new UserPreferenceEntity({ imagePath: './image.png', defaultTheme: 'DEFAULT' })), default: null, nullable: true, required: true, description: 'User preference'
	})
	@Field(returingUserPreferenceEntity, { defaultValue: null, nullable: true, description: 'User preference' })
	@Type(returingUserPreferenceEntity)
	private preference: UserPreferenceEntity | null = null;

	@ApiProperty({ type: Date, example: (new Date('2024-02-28T09:35:31.820')), default: (new Date('2024-02-28T09:35:31.820')), nullable: false, required: false, description: 'User creation timestamp' })
	@Field(returingDate, { defaultValue: (new Date('2024-02-28T09:35:31.820')), nullable: false, description: 'User creation timestamp' })
	@IsDate()
	public readonly createdAt: Date;

	@ApiProperty({ type: Date, example: null, default: null, nullable: true, required: true, description: 'User updated timestamp' })
	@Field(returingDate, { defaultValue: null, nullable: true, description: 'User updated timestamp' })
	@IsDate()
	public updatedAt: Date | null = null;

	@ApiProperty({ type: Date, example: null, default: null, nullable: true, required: true, description: 'User deleted timestamp' })
	@Field(returingDate, { defaultValue: null, nullable: true, description: 'User deleted timestamp' })
	@IsDate()
	public deletedAt: Date | null = null;

	@ApiProperty({ type: String, example: null, default: null, nullable: true, required: true, description: 'Delete userAgent' })
	@Field(returingString, { defaultValue: null, nullable: true, description: 'Delete userAgent' })
	@IsString()
	private deletedBy: string | null = null;

	constructor(dataValues: any) {
		super();
		if (this.exists(dataValues?.id)) this.id = dataValues.id;
		if (this.exists(dataValues?.fullName)) this.fullName = dataValues.fullName;
		if (this.exists(dataValues?.email)) this.email = dataValues.email;
		if (this.exists(dataValues?.password)) this.password = dataValues.password;
		if (this.exists(dataValues?.phone)) this.phone = dataValues.phone;
		if (this.exists(dataValues?.docType)) this.docType = dataValues.docType;
		if (this.exists(dataValues?.document)) this.document = dataValues.document;
		if (this.exists(dataValues?.fu)) this.fu = dataValues.fu;
		if (this.exists(dataValues?.preference)) this.preference = dataValues.preference;
		if (this.exists(dataValues?.updatedAt)) this.updatedAt = dataValues.updatedAt;
		if (this.exists(dataValues?.deletedAt)) this.deletedAt = dataValues.deletedAt;
		if (this.exists(dataValues?.deletedBy)) this.deletedBy = dataValues.deletedBy;
		this.createdAt = this.exists(dataValues?.createdAt) ? new Date(dataValues.createdAt) : this.getDate();
	}

	public getAttributes(): UserInterface {
		return {
			id: this.id,
			fullName: this.fullName ?? undefined,
			email: this.email ?? undefined,
			password: this.password ?? undefined,
			phone: this.phone ?? undefined,
			docType: this.docType ?? undefined,
			document: this.document ?? undefined,
			fu: this.fu ?? undefined,
			preference: this.preference?.getAttributes() ?? undefined,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt ?? undefined,
			deletedAt: this.deletedAt ?? undefined,
			deletedBy: this.deletedBy ?? undefined,
		};
	}

	public getId(): number { return this.id; }
	public setId(id: number): void {
		if (id <= 0)
			return;

		this.id = id;
		this.preference?.setUserId(id);
		this.updatedAt = this.getDate();
	}

	public getLogin(): { fullName: string | null, email: string | null } {
		return {
			fullName: this.fullName,
			email: this.email,
		};
	}

	public setLogin(email: string, fullName: string): void {
		this.fullName = fullName;
		this.email = email;
		this.updatedAt = this.getDate();
	}

	public getPassword(): string | null { return this.password; }
	public setPassword(password: string): void {
		this.password = password;
		this.updatedAt = this.getDate();
	}

	public getPhone(): string | null { return this.phone; }
	public setPhone(phone: string): void {
		this.phone = phone;
		this.updatedAt = this.getDate();
	}

	public getDocInfos(): { document: string | null, docType: string | null, fu: string | null } {
		return {
			document: this.document,
			docType: this.docType,
			fu: this.fu,
		};
	}

	public setDocInfos(docValue: string, docType: string, fu: string): void {
		this.document = docValue;
		this.docType = docType;
		this.fu = fu;
		this.updatedAt = this.getDate();
	}

	public getDeletedBy(): string | null { return this.deletedBy; }

	public setDeletedBy(agentId: string): void {
		this.deletedBy = agentId;
		this.deletedAt = this.getDate();
		this.updatedAt = this.getDate();
	}

	public getPreference(): UserPreferenceEntity | null {
		return this.preference;
	}

	public setPreference(preference: UserPreferenceEntity): void {
		this.preference = preference;
	}
}

export const returingUserEntityArray = () => Array<UserEntity>;

export class UserEntityList extends AbstractEntityList<UserEntity> {
	@ApiProperty({
		type: UserEntity,
		isArray: true,
		example: ([
			new UserEntity({
				fullName: 'User Default',
				docType: 'INVALID',
				fu: 'UF',
				preference: new UserPreferenceEntity({
					imagePath: './image.png',
					defaultTheme: 'DEFAULT',
				}),
				createdAt: new Date('2023-12-31T18:27:25.685Z'),
				updatedAt: new Date('2024-01-01T18:27:25.685Z'),
			}),
		]),
		default: [],
		nullable: false,
		description: 'User list content',
	})
	@Field(returingUserEntityArray, { defaultValue: [], nullable: false, description: 'User list content' })
	@Type(returingUserEntityArray)
	public content: UserEntity[] = [];
}
