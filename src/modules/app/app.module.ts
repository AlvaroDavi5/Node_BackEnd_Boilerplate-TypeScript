import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import LoggerMiddleware from '@api/middlewares/Logger.middleware';
import DefaultController from '@api/controllers/Default.controller';
import UserModule from './user/user.module';
import SubscriptionModule from './subscription/subscription.module';
import HookModule from './hook/hook.module';
import FileModule from './file/file.module';


@Module({
	imports: [
		UserModule,
		SubscriptionModule,
		HookModule,
		FileModule,
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
			.apply(LoggerMiddleware)
			.forRoutes(
				DefaultController,
			);
	}
}
