import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import HttpConstants from '@modules/api/constants/Http.constants';
import LoggerMiddleware from '@modules/api/middlewares/Logger.middleware';
import JwtDecodeMiddleware from '@modules/api/middlewares/JwtDecode.middleware';
import DefaultController from '@modules/api/controllers/Default.controller';
import UserController from '@modules/api/controllers/User.controller';


@Module({
	imports: [],
	controllers: [
		DefaultController,
		UserController,
	],
	providers: [
		HttpConstants,
	],
	exports: [],
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
