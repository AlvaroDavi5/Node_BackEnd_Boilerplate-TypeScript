import { ApiProperty } from '@nestjs/swagger';
import AbstractEntity from '@core/infra/database/entities/AbstractEntity.entity';


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

export default class SubscriptionEntity extends AbstractEntity {
	@ApiProperty({ type: String, example: 'xxx', default: '', nullable: false, required: false })
	private id = '';

	@ApiProperty({ type: String, example: 'WKt2b2RWrMXogTfKAAAD', default: '', nullable: false, required: true })
	private subscriptionId = '';

	@ApiProperty({ type: String, example: 'localDev#0', default: null, nullable: true, required: true })
	private clientId: string | null = null;

	@ApiProperty({ type: Date, example: (new Date()), default: (new Date()), nullable: false, required: false })
	public readonly createdAt: Date;

	@ApiProperty({ type: Date, example: null, default: null, nullable: true, required: false })
	public updatedAt: Date | null = null;

	@ApiProperty({ type: Boolean, example: false, default: false, nullable: false, required: false })
	public newConnectionsListen = false;

	constructor(dataValues: any) {
		super();
		if (this.exists(dataValues?._id)) this.id = dataValues._id;
		if (this.exists(dataValues?.id)) this.id = dataValues.id;
		if (this.exists(dataValues?.subscriptionId)) this.subscriptionId = dataValues.subscriptionId;
		if (this.exists(dataValues?.clientId)) this.clientId = dataValues.clientId;
		if (this.exists(dataValues?.newConnections)) this.newConnectionsListen = dataValues.newConnections;
		if (this.exists(dataValues?.newConnectionsListen)) this.newConnectionsListen = dataValues.newConnectionsListen;
		if (this.exists(dataValues?.updatedAt)) this.updatedAt = dataValues.updatedAt;
		this.createdAt = this.exists(dataValues?.createdAt) ? new Date(dataValues.createdAt) : new Date();
	}

	public getAttributes(): SubscriptionInterface {
		return {
			id: this.id,
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

	public getId(): string { return this.id; }
	public setId(id: string): void {
		if (id.length > 0)
			this.id = id;
	}

	public getSubscriptionId(): string { return this.subscriptionId; }
	public setSubscriptionId(subscriptionId: string): void {
		if (subscriptionId.length > 0)
			this.subscriptionId = subscriptionId;
		this.updatedAt = new Date();
	}

	public getClientId(): string | null { return this.clientId; }
	public setClientId(clientId: string): void {
		if (clientId.length > 0)
			this.clientId = clientId;
		this.updatedAt = new Date();
	}

	public listenNewConnections(): void {
		this.newConnectionsListen = true;
		this.updatedAt = new Date();
	}

	public ignoreNewConnections(): void {
		this.newConnectionsListen = false;
		this.updatedAt = new Date();
	}
}
