import { Controller, Get, OnModuleInit, UseGuards } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ApiOperation, ApiTags, ApiOkResponse, ApiProduces, ApiConsumes } from '@nestjs/swagger';
import { Logger } from 'winston';
import CustomThrottlerGuard from '@api/guards/Throttler.guard';
import authSwaggerDecorator from '@api/decorators/authSwagger.decorator';
import exceptionsResponseDecorator from '@api/decorators/exceptionsResponse.decorator';
import SubscriptionService from '@app/services/Subscription.service';
import SubscriptionEntity, { SubscriptionInterface } from '@app/domain/entities/Subscription.entity';
import LoggerGenerator from '@core/infra/logging/LoggerGenerator.logger';


@ApiTags('Subscriptions')
@Controller('/subscriptions')
@UseGuards(CustomThrottlerGuard)
@authSwaggerDecorator()
export default class SubscriptionsController implements OnModuleInit {
	private subscriptionService!: SubscriptionService;
	private readonly logger: Logger;

	constructor(
		private readonly moduleRef: ModuleRef,
		private readonly loggerGenerator: LoggerGenerator,
	) {
		this.logger = this.loggerGenerator.getLogger();
	}

	public onModuleInit(): void {
		this.subscriptionService = this.moduleRef.get(SubscriptionService, { strict: false });
	}

	@ApiOperation({ summary: 'List Subscriptions' })
	@Get()
	@ApiOkResponse({
		schema: {
			example: [
				new SubscriptionEntity({
					_id: '6561299695e69d3b19ddf979',
					subscriptionId: '5-aUrSIYE7dSVsS8AAAB',
				}),
				new SubscriptionEntity({
					_id: '65612ccebff9f0fbcd58256a',
					subscriptionId: 'WKt2b2RWrMXogTfKAAAD',
					clientId: 'localDev#1',
					newConnections: true,
				}),
			],
			default: [],
		},
	})
	@exceptionsResponseDecorator()
	@ApiConsumes('application/json')
	@ApiProduces('application/json')
	public async listSubscriptions(
	): Promise<SubscriptionInterface[]> {
		try {
			const result = await this.subscriptionService.list();

			return result.map((subscription: SubscriptionEntity) => {
				return subscription.getAttributes();
			});
		} catch (error) {
			this.logger.error(error);
			throw error;
		}
	}
}
