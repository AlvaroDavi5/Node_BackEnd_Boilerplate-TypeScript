import { Injectable } from '@nestjs/common';
import SubscriptionService from '@app/services/Subscription.service';


@Injectable()
export default class SubscriptionServiceAdapter {
	constructor(
		private readonly subscriptionService: SubscriptionService,
	) { }

	public getProvider(): SubscriptionService {
		return this.subscriptionService;
	}
}
