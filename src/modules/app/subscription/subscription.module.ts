import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import RequestMiddleware from '@api/middlewares/Request.middleware';
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
export default class SubscriptionModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(RequestMiddleware)
			.forRoutes(
				SubscriptionController,
			);
	}
}
