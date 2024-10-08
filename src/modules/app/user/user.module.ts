import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import RequestLoggerMiddleware from '@api/middlewares/RequestLogger.middleware';
import UserController from './api/controllers/User.controller';
import UserStrategy from './strategies/User.strategy';
import LoginUserUseCase from './usecases/LoginUser.usecase';
import ListUsersUseCase from './usecases/ListUsers.usecase';
import CreateUserUseCase from './usecases/CreateUser.usecase';
import GetUserUseCase from './usecases/GetUser.usecase';
import UpdateUserUseCase from './usecases/UpdateUser.usecase';
import DeleteUserUseCase from './usecases/DeleteUser.usecase';
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
		LoginUserUseCase,
		ListUsersUseCase,
		CreateUserUseCase,
		GetUserUseCase,
		UpdateUserUseCase,
		DeleteUserUseCase,
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
