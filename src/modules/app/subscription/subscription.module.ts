import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import RequestLoggerMiddleware from '@api/middlewares/RequestLogger.middleware';
import SubscriptionController from './api/controllers/Subscription.controller';
import SubscriptionService from './services/Subscription.service';


@Module({
	imports: [],
	controllers: [
		SubscriptionController,
	],
	providers: [
		SubscriptionService,
	],
	exports: [
		SubscriptionService,
	],
})
export default class SubscriptionModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(RequestLoggerMiddleware)
			.forRoutes(
				SubscriptionController,
			);
	}
}
