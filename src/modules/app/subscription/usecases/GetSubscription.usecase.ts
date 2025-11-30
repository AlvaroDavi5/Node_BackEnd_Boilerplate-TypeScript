import { Injectable } from '@nestjs/common';
import { SubscriptionInterface } from '@domain/entities/Subscription.entity';
import SubscriptionService from '../services/Subscription.service';


@Injectable()
export default class GetSubscriptionUseCase {
	constructor(
		private readonly subscriptionService: SubscriptionService,
	) { }

	public async execute(subscriptionId: string): Promise<SubscriptionInterface> {
		const subscription = await this.subscriptionService.get(subscriptionId);

		return subscription.getAttributes();
	}
}
