import {
	Inject,
	Controller, Req, ParseUUIDPipe,
	Param, Query, Body,
	Get, Post, Put, Patch, Delete,
	UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiProduces, ApiConsumes, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import authSwaggerDecorator from '@api/decorators/authSwagger.decorator';
import exceptionsResponseDecorator from '@api/decorators/exceptionsResponse.decorator';
import UserEntity, { ViewUserInterface } from '@domain/entities/User.entity';
import UserListEntity from '@domain/entities/generic/UserList.entity';
import UserOperation from '@app/user/operations/User.operation';
import CustomThrottlerGuard from '@api/guards/Throttler.guard';
import AuthGuard from '@api/guards/Auth.guard';
import { ListQueryValidatorPipe } from '@api/pipes/QueryValidator.pipe';
import { ListQueryInputDto } from '@api/pipes/dto/QueryInput.dto';
import LoggerService, { REQUEST_LOGGER_PROVIDER } from '@core/logging/Logger.service';
import { RequestInterface } from '@shared/interfaces/endpointInterface';
import { PaginationInterface } from '@shared/interfaces/listPaginationInterface';
import CreateUserValidatorPipe from '../pipes/CreateUserValidator.pipe';
import UpdateUserValidatorPipe from '../pipes/UpdateUserValidator.pipe';
import LoginUserValidatorPipe from '../pipes/LoginUserValidator.pipe';
import CreateUserInputDto from '../dto/user/CreateUserInput.dto';
import UpdateUserInputDto from '../dto/user/UpdateUserInput.dto';
import LoginUserInputDto from '../dto/user/LoginUserInput.dto';


@ApiTags('Users')
@Controller('/users')
@UseGuards(CustomThrottlerGuard)
@exceptionsResponseDecorator()
export default class UserController {
	constructor(
		private readonly userOperation: UserOperation,
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
	): Promise<PaginationInterface<ViewUserInterface>> {
		try {
			const { content, ...listInfo } = await this.userOperation.listUsers(query);
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
	): Promise<ViewUserInterface> {
		try {
			const { user } = request;

			const result = await this.userOperation.createUser(body, user);

			return result.getAttributes();
		} catch (error) {
			this.logger.error(error);
			throw error;
		}
	}

	@authSwaggerDecorator()
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
	): Promise<ViewUserInterface & { token: string }> {
		try {
			const { user, token } = await this.userOperation.loginUser(body);

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
	): Promise<ViewUserInterface> {
		try {
			const { user } = request;

			const result = await this.userOperation.getUser(userId, user);

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
	): Promise<ViewUserInterface> {
		try {
			const { user } = request;

			const result = await this.userOperation.updateUser(userId, body, user);

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

			const result = await this.userOperation.deleteUser(userId, user);

			return { result };
		} catch (error) {
			this.logger.error(error);
			throw error;
		}
	}
}
