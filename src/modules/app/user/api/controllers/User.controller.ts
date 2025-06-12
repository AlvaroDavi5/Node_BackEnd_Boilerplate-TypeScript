import {
	OnModuleInit,
	Controller, Req, Res, ParseUUIDPipe,
	Param, Query, Body,
	Get, Post, Put, Patch, Delete,
	UseGuards, UseFilters, UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiProduces, ApiConsumes, ApiOkResponse, ApiCreatedResponse, ApiNoContentResponse } from '@nestjs/swagger';
import { ModuleRef } from '@nestjs/core';
import Exceptions from '@core/errors/Exceptions';
import UserEntity, { IViewUser } from '@domain/entities/User.entity';
import UserListEntity from '@domain/entities/generic/UserList.entity';
import { EmitterEventsEnum } from '@domain/enums/events.enum';
import LoginUserUseCase from '@app/user/usecases/LoginUser.usecase';
import ListUsersUseCase from '@app/user/usecases/ListUsers.usecase';
import CreateUserUseCase from '@app/user/usecases/CreateUser.usecase';
import GetUserUseCase from '@app/user/usecases/GetUser.usecase';
import UpdateUserUseCase from '@app/user/usecases/UpdateUser.usecase';
import DeleteUserUseCase from '@app/user/usecases/DeleteUser.usecase';
import AuthGuard from '@api/guards/Auth.guard';
import HttpExceptionsFilter from '@api/filters/HttpExceptions.filter';
import ResponseInterceptor from '@api/interceptors/Response.interceptor';
import authSwaggerDecorator from '@api/decorators/authSwagger.decorator';
import exceptionsResponseDecorator from '@api/decorators/exceptionsResponse.decorator';
import ListQueryValidatorPipe from '@api/pipes/QueryValidator.pipe';
import { ListQueryInputDto } from '@api/dto/QueryInput.dto';
import { customThrottlerDecorator } from '@api/decorators/customThrottler.decorator';
import EventEmitterClient from '@events/emitter/EventEmitter.client';
import CustomThrottlerGuard from '@common/guards/CustomThrottler.guard';
import { HttpStatusEnum } from '@common/enums/httpStatus.enum';
import { secondsToMilliseconds } from '@common/utils/dates.util';
import { PaginationInterface } from '@shared/internal/interfaces/listPaginationInterface';
import { RequestInterface, ResponseInterface } from '@shared/internal/interfaces/endpointInterface';
import CreateUserValidatorPipe from '../pipes/CreateUserValidator.pipe';
import UpdateUserValidatorPipe from '../pipes/UpdateUserValidator.pipe';
import LoginUserValidatorPipe from '../pipes/LoginUserValidator.pipe';
import CreateUserInputDto from '../dto/user/CreateUserInput.dto';
import UpdateUserInputDto from '../dto/user/UpdateUserInput.dto';
import LoginUserInputDto from '../dto/user/LoginUserInput.dto';


@ApiTags('Users')
@Controller('/users')
@UseGuards(CustomThrottlerGuard)
@UseFilters(HttpExceptionsFilter)
@UseInterceptors(ResponseInterceptor)
@exceptionsResponseDecorator()
export default class UserController implements OnModuleInit {
	private loginDisabled: boolean; // ANCHOR - feature flag

	constructor(
		private readonly moduleRef: ModuleRef,
		private readonly loginUserUseCase: LoginUserUseCase,
		private readonly listUsersUseCase: ListUsersUseCase,
		private readonly createUserUseCase: CreateUserUseCase,
		private readonly getUserUseCase: GetUserUseCase,
		private readonly updateUserUseCase: UpdateUserUseCase,
		private readonly deleteUserUseCase: DeleteUserUseCase,
		private readonly exceptions: Exceptions,
	) {
		this.loginDisabled = false;
	}

	public onModuleInit(): void {
		const eventEmitterClient = this.moduleRef.get(EventEmitterClient, { strict: false });

		eventEmitterClient.listen(EmitterEventsEnum.DISABLE_LOGIN, (disabled: unknown) => {
			if (typeof disabled === 'boolean')
				this.loginDisabled = disabled;
		});
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
		const { content, ...listInfo } = await this.listUsersUseCase.execute(query);
		const mappedContent = content.map((entity) => entity.getAttributes());

		return {
			content: mappedContent,
			...listInfo,
		};
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
		const { user } = request;

		const result = await this.createUserUseCase.execute(body, user);

		return result.getAttributes();
	}

	@ApiOperation({
		summary: 'Login User',
		description: 'Login user and get user authorization token (1d)',
		deprecated: false,
	})
	@Put('/')
	@customThrottlerDecorator({ name: 'login', limit: 4, ttl: secondsToMilliseconds(10) })
	@ApiOkResponse({
		schema: {
			example: {
				token: 'XXX',
				...(new UserEntity({})).getAttributes(),
			},
		}
	})
	@ApiConsumes('application/json')
	@ApiProduces('application/json')
	public async loginUser(
		@Body(LoginUserValidatorPipe) body: LoginUserInputDto,
	): Promise<IViewUser & { token: string }> {
		// NOTE - gracefull degradation
		if (this.loginDisabled)
			this.throwMaintenanceException();

		const { user, token } = await this.loginUserUseCase.execute(body);

		return { ...user.getAttributes(), token };
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
		const { user } = request;

		const result = await this.getUserUseCase.execute(userId, user);

		return result.getAttributes();
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
		const { user } = request;

		const result = await this.updateUserUseCase.execute(userId, body, user);

		return result.getAttributes();
	}

	@UseGuards(AuthGuard)
	@authSwaggerDecorator()
	@ApiOperation({
		summary: 'Delete User',
		description: 'Delete a user',
		deprecated: false,
	})
	@Delete('/:userId')
	@ApiNoContentResponse({})
	@ApiConsumes('application/json')
	@ApiProduces('application/json')
	public async deleteUser(
		@Req() request: RequestInterface,
		@Res() response: ResponseInterface,
		@Param('userId', ParseUUIDPipe) userId: string,
	): Promise<void> {
		const { user } = request;

		await this.deleteUserUseCase.execute(userId, user);

		response.status(HttpStatusEnum.NO_CONTENT).send(undefined);
	}

	private throwMaintenanceException(): void {
		throw this.exceptions.integration({
			message: 'Resource temporarily under maintenance. Please, try again later',
		});
	}
}
