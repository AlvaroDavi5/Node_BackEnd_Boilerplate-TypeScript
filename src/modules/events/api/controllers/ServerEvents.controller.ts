import {
	Controller, Param,
	Sse, UseGuards
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiProduces, ApiConsumes, ApiOkResponse, ApiParam } from '@nestjs/swagger';
import { interval, Observable, switchMap, take } from 'rxjs';
import { IViewSubscription } from '@domain/entities/Subscription.entity';
import GetSubscriptionUseCase from '@app/subscription/usecases/GetSubscription.usecase';
import exceptionsResponseDecorator from '@api/decorators/exceptionsResponse.decorator';
import CustomThrottlerGuard from '@common/guards/CustomThrottler.guard';
import { ResponseSseInterface } from '@shared/internal/interfaces/endpointInterface';


@ApiTags('Server-Sent Events')
@Controller('/events')
@UseGuards(CustomThrottlerGuard)
@exceptionsResponseDecorator()
export default class ServerEventsController {
	constructor(
		private readonly getSubscriptionUseCase: GetSubscriptionUseCase,
	) { }

	@ApiOperation({
		summary: 'Server-Sent Events',
		description: 'Send to Client the Server events',
		deprecated: false,
	})
	@Sse('subscriptions/:subscriptionId')
	@ApiParam({ name: 'subscriptionId', required: true, example: 'WKt2b2RWrMXogTfKAAAD' })
	@ApiOkResponse({
		schema: {
			example: { number: 1, text: 'OK' },
		}
	})
	@ApiConsumes('text/plain')
	@ApiProduces('text/event-stream')
	getSubscription(
		@Param('subscriptionId') subscriptionId: string,
	): Observable<ResponseSseInterface<IViewSubscription>> {
		const fiveSeconds = 5000;
		const eventLimit = 10;

		return interval(fiveSeconds).pipe(
			take(eventLimit),
			switchMap<number, Promise<ResponseSseInterface<IViewSubscription>>>(async (_value, index) => {
				try {
					const subscription = await this.getSubscriptionUseCase.execute(subscriptionId);

					return {
						timeStamp: Date.now(),
						data: {
							attempt: index + 1,
							data: subscription,
						}
					};
				} catch (error) {
					return {
						timeStamp: Date.now(),
						data: {
							attempt: index + 1,
							error: error as Error,
						}
					};
				}
			})
		);
	}
}
