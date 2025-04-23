import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import RequestMiddleware from '@api/middlewares/Request.middleware';
import HealthController from '@api/controllers/Health.controller';
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
		HealthController,
	],
	providers: [],
	exports: [],
})
export default class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(RequestMiddleware)
			.forRoutes(
				HealthController,
			);
	}
}
