import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import HttpConstants from '@api/constants/Http.constants';
import ContentTypeConstants from './constants/ContentType.constants';
import LoggerMiddleware from '@api/middlewares/Logger.middleware';
import JwtDecodeMiddleware from '@api/middlewares/JwtDecode.middleware';
import DefaultController from '@api/controllers/Default.controller';
import UserController from '@api/controllers/User.controller';


@Module({
	imports: [],
	controllers: [
		DefaultController,
		UserController,
	],
	providers: [
		HttpConstants,
		ContentTypeConstants,
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
