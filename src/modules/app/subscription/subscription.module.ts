import { Module } from '@nestjs/common';
import SubscriptionController from './api/controllers/Subscription.controller';
import SubscriptionService from './services/Subscription.service';
import GetSubscriptionUseCase from './usecases/GetSubscription.usecase';


@Module({
	imports: [],
	controllers: [
		SubscriptionController,
	],
	providers: [
		SubscriptionService,
		GetSubscriptionUseCase,
	],
	exports: [
		SubscriptionService,
		GetSubscriptionUseCase,
	],
})
export default class SubscriptionModule { }
