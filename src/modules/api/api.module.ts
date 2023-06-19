import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import HttpConstants from '@modules/api/constants/HttpConstants';
import LoggerMiddleware from '@modules/api/middlewares/LoggerMiddleware';
import JwtDecodeMiddleware from '@modules/api/middlewares/JwtDecodeMiddleware';
import DefaultController from '@modules/api/controllers/DefaultController';
import UserController from '@modules/api/controllers/UserController';


@Module({
	controllers: [
		DefaultController,
		UserController,
	],
	providers: [
		HttpConstants,
	],
})
export default class ApiModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(LoggerMiddleware)
			.forRoutes(DefaultController, UserController)
			.apply(JwtDecodeMiddleware)
			.forRoutes(UserController);
	}
}
