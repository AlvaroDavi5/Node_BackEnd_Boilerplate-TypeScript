import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import HttpConstants from '@api/constants/Http.constants';
import ContentTypeConstants from './constants/ContentType.constants';
import RequestRateConstants from './constants/RequestRate.constants';
import LoggerMiddleware from '@api/middlewares/Logger.middleware';
import JwtDecodeMiddleware from '@api/middlewares/JwtDecode.middleware';
import DefaultController from '@api/controllers/Default.controller';
import FileController from '@api/controllers/File.controller';
import UserController from '@api/controllers/User.controller';
import SubscriptionController from '@api/controllers/Subscription.controller';
import HookController from '@api/controllers/Hook.controller';


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
		FileController,
		UserController,
		SubscriptionController,
		HookController,
	],
	providers: [
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
			.forRoutes(
				DefaultController,
				FileController,
				UserController,
				SubscriptionController,
				HookController,
			)
			.apply(JwtDecodeMiddleware)
			.forRoutes(
				FileController,
				UserController,
				SubscriptionController,
				HookController,
			);
	}
}
