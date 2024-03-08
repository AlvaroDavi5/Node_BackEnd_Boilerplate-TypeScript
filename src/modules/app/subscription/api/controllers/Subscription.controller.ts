import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiOkResponse, ApiProduces, ApiConsumes } from '@nestjs/swagger';
import { Logger } from 'winston';
import CustomThrottlerGuard from '@api/guards/Throttler.guard';
import AuthGuard from '@api/guards/Auth.guard';
import authSwaggerDecorator from '@api/decorators/authSwagger.decorator';
import exceptionsResponseDecorator from '@api/decorators/exceptionsResponse.decorator';
import SubscriptionService from '@app/subscription/services/Subscription.service';
import SubscriptionEntity, { SubscriptionInterface } from '@domain/entities/Subscription.entity';
import LoggerGenerator from '@core/infra/logging/LoggerGenerator.logger';


@ApiTags('Subscriptions')
@Controller('/subscriptions')
@UseGuards(CustomThrottlerGuard, AuthGuard)
@authSwaggerDecorator()
@exceptionsResponseDecorator()
export default class SubscriptionController {
	private readonly logger: Logger;

	constructor(
		private readonly subscriptionService: SubscriptionService,
		private readonly loggerGenerator: LoggerGenerator,
	) {
		this.logger = this.loggerGenerator.getLogger();
	}

	@ApiOperation({
		summary: 'List Subscriptions',
		description: 'List websockets subscriptions',
		deprecated: false,
	})
	@Get('/')
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
