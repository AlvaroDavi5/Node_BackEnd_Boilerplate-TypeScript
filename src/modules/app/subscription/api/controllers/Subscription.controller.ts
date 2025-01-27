import { Controller, Get, ParseBoolPipe, Query, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiOkResponse, ApiProduces, ApiConsumes } from '@nestjs/swagger';
import CustomThrottlerGuard from '@api/guards/Throttler.guard';
import AuthGuard from '@api/guards/Auth.guard';
import { HttpExceptionsFilter } from '@api/filters/HttpExceptions.filter';
import ResponseInterceptor from '@api/interceptors/Response.interceptor';
import authSwaggerDecorator from '@api/decorators/authSwagger.decorator';
import exceptionsResponseDecorator from '@api/decorators/exceptionsResponse.decorator';
import SubscriptionService from '@app/subscription/services/Subscription.service';
import SubscriptionEntity, { SubscriptionInterface } from '@domain/entities/Subscription.entity';


@ApiTags('Subscriptions')
@Controller('/subscriptions')
@UseGuards(CustomThrottlerGuard, AuthGuard)
@UseFilters(HttpExceptionsFilter)
@UseInterceptors(ResponseInterceptor)
@authSwaggerDecorator()
@exceptionsResponseDecorator()
export default class SubscriptionController {
	constructor(
		private readonly subscriptionService: SubscriptionService,
	) { }

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
		@Query('useCache', ParseBoolPipe) useCache: boolean, // ? feature flag
	): Promise<SubscriptionInterface[]> {
		const result = await this.subscriptionService.list(useCache);

		return result.map((subscription: SubscriptionEntity) => {
			return subscription.getAttributes();
		});
	}
}
