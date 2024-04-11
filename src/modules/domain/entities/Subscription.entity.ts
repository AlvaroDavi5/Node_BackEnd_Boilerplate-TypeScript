import { ObjectType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsDate } from 'class-validator';
import AbstractEntity from '@core/infra/database/entities/AbstractEntity.entity';
import { returingString, returingBoolean, returingDate } from '@shared/types/returnTypeFunc';


export interface SubscriptionInterface {
	id?: string,
	subscriptionId?: string,
	dataValues?: {
		clientId?: string,
		[key: string]: any | undefined,
		readonly createdAt: Date,
		updatedAt?: Date,
	},
	listen?: {
		newConnections?: boolean,
		[key: string]: boolean | undefined,
	},
}

@ObjectType()
export default class SubscriptionEntity extends AbstractEntity<SubscriptionInterface> {
	@ApiProperty({ type: String, example: 'xxx', default: '', nullable: false, required: false, description: 'Database register ID' })
	@Field(returingString, { defaultValue: '', nullable: false, description: 'Database register ID' })
	@IsString()
	private databaseId = '';

	@ApiProperty({ type: String, example: 'WKt2b2RWrMXogTfKAAAD', default: '', nullable: false, required: true, description: 'WebSocket ID' })
	@Field(returingString, { defaultValue: '', nullable: false, description: 'WebSocket ID' })
	@IsString()
	private subscriptionId = '';

	@ApiProperty({ type: String, example: 'localDev#0', default: null, nullable: true, required: true, description: 'CLient machine ID' })
	@Field(returingString, { defaultValue: null, nullable: true, description: 'Client machine ID' })
	@IsString()
	private clientId: string | null = null;

	@ApiProperty({ type: Date, example: (new Date('2024-02-28T09:35:31.820')), default: (new Date('2024-02-28T09:35:31.820')), nullable: false, required: false, description: 'User creation timestamp' })
	@Field(returingDate, { defaultValue: (new Date('2024-02-28T09:35:31.820')), nullable: false, description: 'User creation timestamp' })
	@IsDate()
	public readonly createdAt: Date;

	@ApiProperty({ type: Date, example: null, default: null, nullable: true, required: false, description: 'User updated timestamp' })
	@Field(returingDate, { defaultValue: null, nullable: true, description: 'User updated timestamp' })
	@IsDate()
	public updatedAt: Date | null = null;

	@ApiProperty({ type: Boolean, example: false, default: false, nullable: false, required: false, description: 'Listen new connections flag' })
	@Field(returingBoolean, { defaultValue: false, nullable: false, description: 'Listen new connections flag' })
	@IsBoolean()
	public newConnectionsListen = false;

	constructor(dataValues: any) {
		super();
		const newDataValues = { ...dataValues, ...dataValues?.value };
		const values: any = {
			...newDataValues,
			...newDataValues?.listen,
			...newDataValues.dataValues,
		};
		if (this.exists(values?._id)) this.databaseId = values._id;
		if (this.exists(values?.id)) this.databaseId = values.id;
		if (this.exists(values?.subscriptionId)) this.subscriptionId = values.subscriptionId;
		if (this.exists(values?.clientId)) this.clientId = values.clientId;
		if (this.exists(values?.newConnections)) this.newConnectionsListen = values.newConnections;
		if (this.exists(values?.newConnectionsListen)) this.newConnectionsListen = values.newConnectionsListen;
		if (this.exists(values?.updatedAt)) this.updatedAt = values.updatedAt;
		this.createdAt = this.exists(values?.createdAt) ? this.getDate(values.createdAt) : this.getDate();
	}

	public getAttributes(): SubscriptionInterface {
		return {
			id: this.databaseId,
			subscriptionId: this.subscriptionId,
			dataValues: {
				clientId: this.clientId ?? undefined,
				createdAt: this.createdAt,
				updatedAt: this.updatedAt ?? undefined,
			} ?? undefined,
			listen: {
				newConnections: this.newConnectionsListen,
			} ?? undefined,
		};
	}

	public getDatabaseId(): string { return this.databaseId; }
	public setDatabaseId(id: string): void {
		if (id.length > 0)
			this.databaseId = id;
	}

	public getSubscriptionId(): string { return this.subscriptionId; }
	public setSubscriptionId(subscriptionId: string): void {
		if (subscriptionId.length > 0)
			this.subscriptionId = subscriptionId;
		this.updatedAt = this.getDate();
	}

	public getClientId(): string | null { return this.clientId; }
	public setClientId(clientId: string): void {
		if (clientId.length > 0)
			this.clientId = clientId;
		this.updatedAt = this.getDate();
	}

	public listenNewConnections(): void {
		this.newConnectionsListen = true;
		this.updatedAt = this.getDate();
	}

	public ignoreNewConnections(): void {
		this.newConnectionsListen = false;
		this.updatedAt = this.getDate();
	}
}
