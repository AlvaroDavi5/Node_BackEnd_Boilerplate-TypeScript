import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import LoggerMiddleware from '@modules/boilerplate/interface/http/middlewares/LoggerMiddleware';
import JwtDecodeMiddleware from '@modules/boilerplate/interface/http/middlewares/JwtDecodeMiddleware';
import DefaultController from '@modules/boilerplate/interface/http/controllers/DefaultController';
import UserController from '@modules/boilerplate/interface/http/controllers/UserController';
import HttpConstants from '@modules/boilerplate/interface/http/constants/HttpConstants';
import UserStrategy from '@modules/boilerplate/app/strategies/UserStrategy';
import UserOperation from '@modules/boilerplate/app/operations/UserOperation';
import UserService from '@modules/boilerplate/app/services/UserService';
import UserPreferenceService from '@modules/boilerplate/app/services/UserPreferenceService';
import UserRepository from '@modules/boilerplate/infra/repositories/user/UserRepository';
import UserPreferenceRepository from '@modules/boilerplate/infra/repositories/userPreference/UserPreferenceRepository';


@Module({
	controllers: [
		DefaultController,
		UserController,
	],
	providers: [
		HttpConstants,
		UserStrategy,
		UserOperation,
		UserService,
		UserPreferenceService,
		UserRepository,
		UserPreferenceRepository,
	],
})
export default class BoilerplateModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(LoggerMiddleware)
			.forRoutes(DefaultController, UserController)
			.apply(JwtDecodeMiddleware)
			.forRoutes(UserController);
	}
}
