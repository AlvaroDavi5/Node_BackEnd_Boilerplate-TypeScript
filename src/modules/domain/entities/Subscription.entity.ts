import { ObjectType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsDate, IsUUID } from 'class-validator';
import { fromISOToDateTime, fromDateTimeToJSDate, getDateTimeNow } from '@common/utils/dates.util';
import { TimeZonesEnum } from '@common/enums/timeZones.enum';
import AbstractEntity from '@shared/internal/classes/AbstractEntity.entity';
import { returingString, returingBoolean, returingDate } from '@shared/internal/types/returnTypeFunc';


const dateTimeExample = fromISOToDateTime('2024-06-10T03:52:50.885Z', false, TimeZonesEnum.America_SaoPaulo);
const dateExample = fromDateTimeToJSDate(dateTimeExample, false);
const getDateNow = () => fromDateTimeToJSDate(getDateTimeNow(TimeZonesEnum.America_SaoPaulo));

export interface SubscriptionInterface {
	id?: string,
	subscriptionId?: string,
	dataValues: {
		clientId?: string,
		[key: string]: unknown | undefined,
		readonly createdAt: Date,
		updatedAt?: Date,
	},
	listen: {
		newConnections: boolean,
	},
}

export type ICreateSubscription = Omit<SubscriptionInterface, 'id' | 'subscriptionId'>;
export type IUpdateSubscription = Partial<ICreateSubscription> & { subscriptionId?: string };
export type IViewSubscription = SubscriptionInterface;

@ObjectType()
export default class SubscriptionEntity extends AbstractEntity<SubscriptionInterface> {
	@ApiProperty({
		type: String,
		example: 'a5483856-1bf7-4dae-9c21-d7ea4dd30d1d',
		default: '', nullable: false, required: false,
		description: 'Database register ID',
	})
	@Field(returingString, { defaultValue: '', nullable: false, description: 'Database register ID' })
	@IsString()
	@IsUUID()
	private databaseId!: string;

	@ApiProperty({ type: String, example: 'WKt2b2RWrMXogTfKAAAD', default: '', nullable: false, required: true, description: 'WebSocket ID' })
	@Field(returingString, { defaultValue: '', nullable: false, description: 'WebSocket ID' })
	@IsString()
	private subscriptionId = '';

	@ApiProperty({ type: String, example: 'localDev#0', default: null, nullable: true, required: true, description: 'CLient machine ID' })
	@Field(returingString, { defaultValue: null, nullable: true, description: 'Client machine ID' })
	@IsString()
	private clientId: string | null = null;

	@ApiProperty({ type: Date, example: dateExample, default: dateExample, nullable: false, required: false, description: 'User creation timestamp' })
	@Field(returingDate, { defaultValue: getDateNow(), nullable: false, description: 'User creation timestamp' })
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

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	constructor(dataValues: any) {
		super();
		const newDataValues = { ...dataValues, ...dataValues?.value };
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
			},
			listen: {
				newConnections: this.newConnectionsListen,
			},
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
