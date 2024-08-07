import {
	Inject,
	Controller, Req, ParseUUIDPipe,
	Param, Query, Body,
	Get, Post, Put, Patch, Delete,
	UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiProduces, ApiConsumes, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import LoggerService, { REQUEST_LOGGER_PROVIDER } from '@core/logging/Logger.service';
import UserEntity, { IViewUser } from '@domain/entities/User.entity';
import UserListEntity from '@domain/entities/generic/UserList.entity';
import LoginUserUseCase from '@app/user/usecases/LoginUser.usecase';
import ListUsersUseCase from '@app/user/usecases/ListUsers.usecase';
import CreateUserUseCase from '@app/user/usecases/CreateUser.usecase';
import GetUserUseCase from '@app/user/usecases/GetUser.usecase';
import UpdateUserUseCase from '@app/user/usecases/UpdateUser.usecase';
import DeleteUserUseCase from '@app/user/usecases/DeleteUser.usecase';
import CustomThrottlerGuard from '@api/guards/Throttler.guard';
import AuthGuard from '@api/guards/Auth.guard';
import authSwaggerDecorator from '@api/decorators/authSwagger.decorator';
import exceptionsResponseDecorator from '@api/decorators/exceptionsResponse.decorator';
import { ListQueryValidatorPipe } from '@api/pipes/QueryValidator.pipe';
import { ListQueryInputDto } from '@api/dto/QueryInput.dto';
import CreateUserValidatorPipe from '../pipes/CreateUserValidator.pipe';
import UpdateUserValidatorPipe from '../pipes/UpdateUserValidator.pipe';
import LoginUserValidatorPipe from '../pipes/LoginUserValidator.pipe';
import CreateUserInputDto from '../dto/user/CreateUserInput.dto';
import UpdateUserInputDto from '../dto/user/UpdateUserInput.dto';
import LoginUserInputDto from '../dto/user/LoginUserInput.dto';
import { RequestInterface } from '@shared/internal/interfaces/endpointInterface';
import { PaginationInterface } from '@shared/internal/interfaces/listPaginationInterface';


@ApiTags('Users')
@Controller('/users')
@UseGuards(CustomThrottlerGuard)
@exceptionsResponseDecorator()
export default class UserController {
	constructor(
		private readonly loginUserUseCase: LoginUserUseCase,
		private readonly listUsersUseCase: ListUsersUseCase,
		private readonly createUserUseCase: CreateUserUseCase,
		private readonly getUserUseCase: GetUserUseCase,
		private readonly updateUserUseCase: UpdateUserUseCase,
		private readonly deleteUserUseCase: DeleteUserUseCase,
		@Inject(REQUEST_LOGGER_PROVIDER)
		private readonly logger: LoggerService,
	) {
		this.logger.setContextName(UserController.name);
	}

	@UseGuards(AuthGuard)
	@authSwaggerDecorator()
	@ApiOperation({
		summary: 'List Users',
		description: 'List all users from cache or database',
		deprecated: false,
	})
	@Get('/')
	@ApiOkResponse({
		type: UserListEntity,
		schema: {
			example: (new UserListEntity()),
		},
	})
	@ApiConsumes('application/json')
	@ApiProduces('application/json')
	public async listUsers(
		@Query(ListQueryValidatorPipe) query: ListQueryInputDto,
	): Promise<PaginationInterface<IViewUser>> {
		try {
			const { content, ...listInfo } = await this.listUsersUseCase.execute(query);
			const mappedContent = content.map((entity) => entity.getAttributes());

			return {
				content: mappedContent,
				...listInfo,
			};
		} catch (error) {
			this.logger.error(error);
			throw error;
		}
	}

	@UseGuards(AuthGuard)
	@authSwaggerDecorator()
	@ApiOperation({
		summary: 'Create User',
		description: 'Create a new user',
		deprecated: false,
	})
	@Post('/')
	@ApiCreatedResponse({ type: UserEntity })
	@ApiConsumes('application/json')
	@ApiProduces('application/json')
	public async createUser(
		@Req() request: RequestInterface,
		@Body(CreateUserValidatorPipe) body: CreateUserInputDto,
	): Promise<IViewUser> {
		try {
			const { user } = request;

			const result = await this.createUserUseCase.execute(body, user);

			return result.getAttributes();
		} catch (error) {
			this.logger.error(error);
			throw error;
		}
	}

	@ApiOperation({
		summary: 'Login User',
		description: 'Login user and get user authorization token (1d)',
		deprecated: false,
	})
	@Put('/')
	@ApiOkResponse({ type: UserEntity })
	@ApiConsumes('application/json')
	@ApiProduces('application/json')
	public async loginUser(
		@Body(LoginUserValidatorPipe) body: LoginUserInputDto,
	): Promise<IViewUser & { token: string }> {
		try {
			const { user, token } = await this.loginUserUseCase.execute(body);

			return { ...user.getAttributes(), token };
		} catch (error) {
			this.logger.error(error);
			throw error;
		}
	}

	@UseGuards(AuthGuard)
	@authSwaggerDecorator()
	@ApiOperation({
		summary: 'Get User',
		description: 'Get user by ID',
		deprecated: false,
	})
	@Get('/:userId')
	@ApiOkResponse({ type: UserEntity })
	@ApiConsumes('application/json')
	@ApiProduces('application/json')
	public async getUser(
		@Req() request: RequestInterface,
		@Param('userId', ParseUUIDPipe) userId: string,
	): Promise<IViewUser> {
		try {
			const { user } = request;

			const result = await this.getUserUseCase.execute(userId, user);

			return result.getAttributes();
		} catch (error) {
			this.logger.error(error);
			throw error;
		}
	}

	@UseGuards(AuthGuard)
	@authSwaggerDecorator()
	@ApiOperation({
		summary: 'Update User',
		description: 'Update registered user',
		deprecated: false,
	})
	@Patch('/:userId')
	@ApiOkResponse({ type: UserEntity })
	@ApiConsumes('application/json')
	@ApiProduces('application/json')
	public async updateUser(
		@Req() request: RequestInterface,
		@Param('userId', ParseUUIDPipe) userId: string,
		@Body(UpdateUserValidatorPipe) body: UpdateUserInputDto,
	): Promise<IViewUser> {
		try {
			const { user } = request;

			const result = await this.updateUserUseCase.execute(userId, body, user);

			return result.getAttributes();
		} catch (error) {
			this.logger.error(error);
			throw error;
		}
	}

	@UseGuards(AuthGuard)
	@authSwaggerDecorator()
	@ApiOperation({
		summary: 'Delete User',
		description: 'Delete a user',
		deprecated: false,
	})
	@Delete('/:userId')
	@ApiOkResponse({ schema: { example: { result: true } } })
	@ApiConsumes('application/json')
	@ApiProduces('application/json')
	public async deleteUser(
		@Req() request: RequestInterface,
		@Param('userId', ParseUUIDPipe) userId: string,
	): Promise<[affectedCount: number] | unknown> {
		try {
			const { user } = request;

			const result = await this.deleteUserUseCase.execute(userId, user);

			return { result };
		} catch (error) {
			this.logger.error(error);
			throw error;
		}
	}
}
