import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import RequestLoggerMiddleware from '@api/middlewares/RequestLogger.middleware';
import DefaultController from '@api/controllers/Default.controller';
import UserModule from './user/user.module';
import SubscriptionModule from './subscription/subscription.module';
import HookModule from './hook/hook.module';
import FileModule from './file/file.module';


@Module({
	imports: [
		UserModule,
		SubscriptionModule,
		FileModule,
		HookModule,
	],
	controllers: [
		DefaultController,
	],
	providers: [],
	exports: [],
})
export default class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(RequestLoggerMiddleware)
			.forRoutes(
				DefaultController,
			);
	}
}
