import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import RequestLoggerMiddleware from '@api/middlewares/RequestLogger.middleware';
import HookController from './api/controllers/Hook.controller';
import WebhookService from './services/Webhook.service';


@Module({
	imports: [],
	controllers: [
		HookController,
	],
	providers: [
		WebhookService,
	],
	exports: [],
})
export default class HookModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(RequestLoggerMiddleware)
			.forRoutes(
				HookController,
			);
	}
}
