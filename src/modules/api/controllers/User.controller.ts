import {
	Controller, Req, ParseIntPipe,
	Param, Query, Body,
	Get, Post, Put, Patch, Delete,
	OnModuleInit, UseGuards,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ApiOperation, ApiTags, ApiProduces, ApiConsumes, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { Logger } from 'winston';
import authSwaggerDecorator from '@api/decorators/authSwagger.decorator';
import exceptionsResponseDecorator from '@api/decorators/exceptionsResponse.decorator';
import UserEntity, { UserEntityList, UserInterface } from '@app/domain/entities/User.entity';
import UserOperation from '@app/operations/User.operation';
import CustomThrottlerGuard from '@api/guards/Throttler.guard';
import AuthGuard from '@api/guards/Auth.guard';
import { ListQueryPipeValidator } from '@api/pipes/QueryValidator.pipe';
import { ListQueryInputDto } from '@api/pipes/dto/QueryInput.dto';
import { CreateUserPipeValidator, UpdateUserPipeValidator, LoginUserPipeValidator } from '@api/pipes/UserValidator.pipe';
import { CreateUserInputDto, UpdateUserInputDto, LoginUserInputDto } from '@api/pipes/dto/UserInput.dto';
import LoggerGenerator from '@core/infra/logging/LoggerGenerator.logger';
import { RequestInterface } from '@shared/interfaces/endpointInterface';
import { PaginationInterface } from '@shared/interfaces/listPaginationInterface';


@ApiTags('Users')
@Controller('/users')
@UseGuards(CustomThrottlerGuard, AuthGuard)
@authSwaggerDecorator()
@exceptionsResponseDecorator()
export default class UserController implements OnModuleInit {
	private userOperation!: UserOperation;
	private readonly logger: Logger;

	constructor(
		private readonly moduleRef: ModuleRef,
		private readonly loggerGenerator: LoggerGenerator,
	) {
		this.logger = this.loggerGenerator.getLogger();
	}

	public onModuleInit(): void {
		this.userOperation = this.moduleRef.get(UserOperation, { strict: false });
	}

	@ApiOperation({
		summary: 'List Users',
		description: 'List all users from cache or database',
		deprecated: false,
	})
	@Get('/')
	@ApiOkResponse({
		type: UserEntityList,
		schema: {
			example: (new UserEntityList()),
		},
	})
	@ApiConsumes('application/json')
	@ApiProduces('application/json')
	public async listUsers(
		@Query(ListQueryPipeValidator) query: ListQueryInputDto,
	): Promise<PaginationInterface<UserInterface>> {
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

	@ApiOperation({ summary: 'Create User' })
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
		@Body(CreateUserPipeValidator) body: CreateUserInputDto,
	): Promise<UserInterface> {
		try {
			const { user } = request;

			const result = await this.userOperation.createUser(body, user);

			return result.getAttributes();
		} catch (error) {
			this.logger.error(error);
			throw error;
		}
	}

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
		@Param('userId', ParseIntPipe) userId: number,
	): Promise<UserInterface> {
		try {
			const { user } = request;

			const result = await this.userOperation.getUser(userId, user);

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
		@Body(LoginUserPipeValidator) body: LoginUserInputDto,
	): Promise<UserInterface & { token: string }> {
		try {
			const { user, token } = await this.userOperation.loginUser(body);

			return { ...user.getAttributes(), token };
		} catch (error) {
			this.logger.error(error);
			throw error;
		}
	}

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
		@Param('userId', ParseIntPipe) userId: number,
		@Body(UpdateUserPipeValidator) body: UpdateUserInputDto,
	): Promise<UserInterface> {
		try {
			const { user } = request;

			const result = await this.userOperation.updateUser(userId, body, user);

			return result.getAttributes();
		} catch (error) {
			this.logger.error(error);
			throw error;
		}
	}

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
		@Param('userId', ParseIntPipe) userId: number,
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
