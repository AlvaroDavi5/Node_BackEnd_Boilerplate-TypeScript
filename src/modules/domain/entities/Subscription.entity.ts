import { ObjectType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsDate } from 'class-validator';
import DateGeneratorHelper from '@common/utils/helpers/DateGenerator.helper';
import { TimeZonesEnum } from '@common/enums/timeZones.enum';
import AbstractEntity from '@shared/classes/AbstractEntity.entity';
import { returingString, returingBoolean, returingDate } from '@shared/types/returnTypeFunc';


const dateGeneratorHelper = new DateGeneratorHelper();
const dateExample = dateGeneratorHelper.getDate('2024-06-10T03:52:50.885Z', 'iso-8601', true, TimeZonesEnum.SaoPaulo);

export interface SubscriptionInterface {
	id?: string,
	subscriptionId?: string,
	dataValues: {
		clientId?: string,
		[key: string]: any | undefined,
		readonly createdAt: Date,
		updatedAt?: Date,
	},
	listen: {
		newConnections: boolean,
	},
}

export type CreateSubscriptionInterface = Omit<SubscriptionInterface, 'id' | 'subscriptionId'>;
export type UpdateSubscriptionInterface = Partial<SubscriptionInterface>;
export type ViewSubscriptionInterface = SubscriptionInterface;

@ObjectType()
export default class SubscriptionEntity extends AbstractEntity<SubscriptionInterface> {
	@ApiProperty({ type: String, example: 'WKt2b2RWrMXogTfKAAAD', default: '', nullable: false, required: true, description: 'WebSocket ID' })
	@Field(returingString, { defaultValue: '', nullable: false, description: 'WebSocket ID' })
	@IsString()
	private subscriptionId = '';

	@ApiProperty({ type: String, example: 'localDev#0', default: null, nullable: true, required: true, description: 'CLient machine ID' })
	@Field(returingString, { defaultValue: null, nullable: true, description: 'Client machine ID' })
	@IsString()
	private clientId: string | null = null;

	@ApiProperty({ type: Date, example: dateExample, default: dateExample, nullable: false, required: false, description: 'User creation timestamp' })
	@Field(returingDate, { defaultValue: dateGeneratorHelper.getDate(new Date(), 'jsDate', true), nullable: false, description: 'User creation timestamp' })
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
		super({});
		const newDataValues = { ...dataValues, ...dataValues?.value };
		const values: any = {
			...newDataValues,
			...newDataValues?.listen,
			...newDataValues.dataValues,
		};
		if (this.exists(values?._id)) this.setId(values._id);
		if (this.exists(values?.id)) this.setId(values.id);
		if (this.exists(values?.subscriptionId)) this.subscriptionId = values.subscriptionId;
		if (this.exists(values?.clientId)) this.clientId = values.clientId;
		if (this.exists(values?.newConnections)) this.newConnectionsListen = values.newConnections;
		if (this.exists(values?.newConnectionsListen)) this.newConnectionsListen = values.newConnectionsListen;
		if (this.exists(values?.updatedAt)) this.updatedAt = values.updatedAt;
		this.createdAt = this.exists(values?.createdAt) ? this.getDate(values.createdAt) : this.getDate();
	}

	public getAttributes(): SubscriptionInterface {
		return {
			id: this.getId(),
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
