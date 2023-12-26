import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import AbstractEntity, { AbstractEntityList } from '@core/infra/database/entities/AbstractEntity.entity';
import UserPreferenceEntity from './UserPreference.entity';


export interface UserInterface {
	id?: number,
	fullName?: string,
	email?: string,
	password?: string,
	phone?: string,
	docType?: string,
	document?: string,
	fu?: string,
	preference?: UserPreferenceEntity,
	readonly createdAt: Date,
	updatedAt?: Date,
	deletedAt?: Date,
	deletedBy?: string,
}

export default class UserEntity extends AbstractEntity {
	@ApiProperty({ type: Number, example: 0, default: 0, nullable: false, required: false })
	private id = 0;

	@ApiProperty({ type: String, example: 'User Default', default: null, nullable: true, required: true })
	public fullName: string | null = null;

	@ApiProperty({ type: String, example: 'user.default@nomail.dev', default: null, nullable: true, required: true })
	private email: string | null = null;

	@ApiProperty({ type: String, example: 'cGFzczEyMw==', default: null, nullable: true, required: true })
	private password: string | null = null;

	@ApiProperty({ type: String, example: '+0000000000000', default: null, nullable: true, required: true })
	private phone: string | null = null;

	@ApiProperty({ type: String, example: 'INVALID', default: null, nullable: true, required: true })
	public docType: string | null = null;

	@ApiProperty({ type: String, example: '00000000000', default: null, nullable: true, required: true })
	private document: string | null = null;

	@ApiProperty({ type: String, example: 'UF', default: null, nullable: true, required: true })
	public fu: string | null = null;

	@ApiProperty({ type: UserPreferenceEntity, example: (new UserPreferenceEntity({})), default: null, nullable: true, required: true })
	@Type(() => UserPreferenceEntity)
	private preference: UserPreferenceEntity | null = null;

	@ApiProperty({ type: Date, example: (new Date()), default: (new Date()), nullable: false, required: false })
	public readonly createdAt: Date;

	@ApiProperty({ type: Date, example: null, default: null, nullable: true, required: true })
	public updatedAt: Date | null = null;

	@ApiProperty({ type: Date, example: null, default: null, nullable: true, required: true })
	public deletedAt: Date | null = null;

	@ApiProperty({ type: String, example: null, default: null, nullable: true, required: true })
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
		this.createdAt = this.exists(dataValues?.createdAt) ? new Date(dataValues.createdAt) : new Date();
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
			preference: this.preference ?? undefined,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt ?? undefined,
			deletedAt: this.deletedAt ?? undefined,
			deletedBy: this.deletedBy ?? undefined,
		};
	}

	public getId(): number { return this.id; }
	public setId(id: number): void {
		if (id > 0)
			this.id = id;
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
		this.updatedAt = new Date();
	}

	public getPassword(): string | null { return this.password; }
	public setPassword(passwd: string): void {
		this.password = passwd;
		this.updatedAt = new Date();
	}

	public getPhone(): string | null { return this.phone; }
	public setPhone(phone: string): void {
		this.phone = phone;
		this.updatedAt = new Date();
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
		this.updatedAt = new Date();
	}

	public getDeletedBy(): string | null { return this.deletedBy; }

	public setDeletedBy(agentId: string): void {
		this.deletedBy = agentId;
		this.deletedAt = new Date();
		this.updatedAt = new Date();
	}

	public getPreference(): UserPreferenceEntity | null {
		return this.preference;
	}

	public setPreference(preference: UserPreferenceEntity): void {
		this.preference = preference;
	}
}

export class UserEntityList extends AbstractEntityList<UserEntity> {
	@ApiProperty({ type: UserEntity, isArray: true, example: ([new UserEntity({})]), default: [], nullable: false })
	@Type(() => Array<UserEntity>)
	public content: UserEntity[] = [];
}
