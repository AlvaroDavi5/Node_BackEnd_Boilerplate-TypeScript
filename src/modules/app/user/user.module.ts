import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import RequestLoggerMiddleware from '@api/middlewares/RequestLogger.middleware';
import UserController from './api/controllers/User.controller';
import UserStrategy from './strategies/User.strategy';
import UserOperation from './operations/User.operation';
import UserService from './services/User.service';
import UserPreferenceService from './services/UserPreference.service';
import UserRepository from './repositories/user/User.repository';
import UserPreferenceRepository from './repositories/userPreference/UserPreference.repository';


@Module({
	imports: [],
	controllers: [
		UserController,
	],
	providers: [
		UserStrategy,
		UserOperation,
		UserService,
		UserPreferenceService,
		UserRepository,
		UserPreferenceRepository,
	],
	exports: [],
})
export default class UserModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(RequestLoggerMiddleware)
			.forRoutes(
				UserController,
			);
	}
}
