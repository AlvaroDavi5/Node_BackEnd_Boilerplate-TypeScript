import { APP_GUARD } from '@nestjs/core';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import HttpConstants from '@api/constants/Http.constants';
import ContentTypeConstants from './constants/ContentType.constants';
import RequestRateConstants from './constants/RequestRate.constants';
import LoggerMiddleware from '@api/middlewares/Logger.middleware';
import JwtDecodeMiddleware from '@api/middlewares/JwtDecode.middleware';
import DefaultController from '@api/controllers/Default.controller';
import UserController from '@api/controllers/User.controller';
import SubscriptionsController from '@api/controllers/Subscriptions.controller';


const requestRateConstants = new RequestRateConstants();

@Module({
	imports: [
		ThrottlerModule.forRoot([
			requestRateConstants.short,
			requestRateConstants.medium,
			requestRateConstants.long,
		]),
	],
	controllers: [
		DefaultController,
		UserController,
		SubscriptionsController,
	],
	providers: [
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
		HttpConstants,
		ContentTypeConstants,
		RequestRateConstants,
	],
	exports: [],
})
export default class ApiModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(LoggerMiddleware)
			.forRoutes(DefaultController, UserController, SubscriptionsController)
			.apply(JwtDecodeMiddleware)
			.forRoutes(UserController, SubscriptionsController);
	}
}
