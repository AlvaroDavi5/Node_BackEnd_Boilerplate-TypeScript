import { ObjectType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDate, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { TimeZonesEnum } from '@common/enums/timeZones.enum';
import { fromISOToDateTime, fromDateTimeToJSDate, getDateTimeNow } from '@common/utils/dates.util';
import AbstractEntity from '@shared/internal/classes/AbstractEntity.entity';
import { returingString, returingDate } from '@shared/internal/types/returnTypeFunc';
import UserPreferenceEntity, { ICreateUserPreference, UserPreferenceInterface, returingUserPreferenceEntity } from './UserPreference.entity';


export interface UserInterface<UP = UserPreferenceInterface> {
	id?: string,
	fullName: string,
	email: string,
	password: string,
	phone?: string,
	docType?: string,
	document?: string,
	fu?: string,
	preference?: UP,
	readonly createdAt: Date,
	updatedAt?: Date,
	deletedAt?: Date,
	deletedBy?: string,
}

export type ICreateUser = Omit<UserInterface<ICreateUserPreference>, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
export type IUpdateUser = Partial<ICreateUser>;
export type IViewUser = UserInterface;
export type IViewUserWithoutPassword = Omit<UserInterface, 'password'>;
export type IViewUserWithoutSensitiveData = Omit<UserInterface, 'password' | 'phone' | 'document'>;

const dateTimeExample = fromISOToDateTime('2024-06-10T03:52:50.885Z', false, TimeZonesEnum.America_SaoPaulo);
const dateExample = fromDateTimeToJSDate(dateTimeExample, false);
const getDateNow = () => fromDateTimeToJSDate(getDateTimeNow(TimeZonesEnum.America_SaoPaulo));

@ObjectType({
	description: 'user entity',
})
export default class UserEntity extends AbstractEntity<UserInterface> {
	@ApiProperty({
		type: String,
		example: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d',
		default: '', nullable: false, required: false,
		description: 'Database register ID',
	})
	@Field(returingString, { defaultValue: '', nullable: false, description: 'Database register ID' })
	@IsString()
	@IsUUID()
	private id!: string;

	@ApiProperty({ type: String, example: 'User Default', default: null, nullable: true, required: true, description: 'User name' })
	@Field(returingString, { defaultValue: null, nullable: true, description: 'User name' })
	@IsString()
	public fullName!: string;

	@ApiProperty({ type: String, example: 'user.default@nomail.dev', default: null, nullable: true, required: true, description: 'User email' })
	@Field(returingString, { defaultValue: null, nullable: true, description: 'User email' })
	@IsString()
	private email!: string;

	@ApiProperty({ type: String, example: 'cGFzczEyMw==', default: null, nullable: true, required: true, description: 'User password' })
	@Field(returingString, { defaultValue: null, nullable: true, description: 'User password' })
	@IsString()
	private password!: string;

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
		type: UserPreferenceEntity,
		example: (new UserPreferenceEntity({ imagePath: './image.png', defaultTheme: 'DEFAULT' })),
		default: null, nullable: true, required: true,
		description: 'User preference',
	})
	@Type(returingUserPreferenceEntity)
	@Field(returingUserPreferenceEntity, { defaultValue: null, nullable: true, description: 'User preference' })
	private preference: UserPreferenceEntity | null = null;

	@ApiProperty({ type: Date, example: dateExample, default: getDateNow(), nullable: false, required: false, description: 'User creation timestamp' })
	@Field(returingDate, { defaultValue: getDateNow(), nullable: false, description: 'User creation timestamp' })
	@IsDate()
	public readonly createdAt: Date;

	@ApiProperty({ type: Date, example: null, default: null, nullable: true, required: false, description: 'User updated timestamp' })
	@Field(returingDate, { defaultValue: null, nullable: true, description: 'User updated timestamp' })
	@IsDate()
	public updatedAt: Date | null = null;

	@ApiProperty({ type: Date, example: null, default: null, nullable: true, required: true, description: 'User deleted timestamp' })
	@Field(returingDate, { defaultValue: null, nullable: true, description: 'User deleted timestamp' })
	@IsDate()
	public deletedAt: Date | null = null;

	@ApiProperty({ type: String, example: null, default: null, nullable: true, required: true, description: 'Deleted by agentUser' })
	@Field(returingString, { defaultValue: null, nullable: true, description: 'Deleted by agentUser' })
	@IsString()
	private deletedBy: string | null = null;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
		if (this.exists(dataValues?.preference)) this.preference = new UserPreferenceEntity(dataValues.preference);
		if (this.exists(dataValues?.updatedAt)) this.updatedAt = dataValues.updatedAt;
		if (this.exists(dataValues?.deletedAt)) this.deletedAt = dataValues.deletedAt;
		if (this.exists(dataValues?.deletedBy)) this.deletedBy = dataValues.deletedBy;
		this.createdAt = this.exists(dataValues?.createdAt) ? this.getDate(dataValues.createdAt) : this.getDate();
	}

	public getAttributes(): IViewUser {
		return {
			id: this.id,
			fullName: this.fullName,
			email: this.email,
			password: this.password,
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

	public getId(): string { return this.id; }
	public setId(id: string): void {
		if (id.length < 1)
			return;

		this.id = id;
		this.preference?.setUserId(id);
		this.updatedAt = this.getDate();
	}

	public getFullName(): string { return this.fullName; }
	public setFullName(fullName: string): void {
		this.fullName = fullName;
		this.updatedAt = this.getDate();
	}

	public getEmail(): string { return this.email; }
	public setEmail(email: string): void {
		this.email = email;
		this.updatedAt = this.getDate();
	}

	public getPassword(): string { return this.password; }
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
