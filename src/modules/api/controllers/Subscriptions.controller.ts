import { Controller, Get, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ApiOperation, ApiTags, ApiOkResponse, ApiProduces } from '@nestjs/swagger';
import { Document, WithId } from 'mongodb';
import authSwaggerDecorator from '@api/decorators/authSwagger.decorator';
import SubscriptionService from '@app/services/Subscription.service';


@ApiTags('Subscriptions')
@Controller('/subscriptions')
@authSwaggerDecorator()
export default class SubscriptionsController implements OnModuleInit {
	private subscriptionService!: SubscriptionService;

	constructor(
		private readonly moduleRef: ModuleRef,
	) { }

	public onModuleInit(): void {
		this.subscriptionService = this.moduleRef.get(SubscriptionService, { strict: false });
	}

	@ApiOperation({ summary: 'List Subscriptions' })
	@Get()
	@ApiOkResponse({
		schema: {
			example: {
				subcriptions: [
					{
						_id: '6561299695e69d3b19ddf979',
						subscriptionId: '5-aUrSIYE7dSVsS8AAAB',
					},
					{
						_id: '65612ccebff9f0fbcd58256a',
						subscriptionId: 'WKt2b2RWrMXogTfKAAAD',
						dataValues: {
							clientId: 'localDev#1',
						},
						listen: {
							newConnections: true,
						},
					},
				],
			}
		}
	})
	@ApiProduces('application/json')
	public async listSubscriptions(): Promise<WithId<Document>[] | unknown> {
		try {
			const result = await this.subscriptionService.list();
			return result;
		} catch (error) {
			return error;
		}
	}
}
