import {
	Controller, Req, ParseIntPipe,
	Param, Query, Body,
	Get, Post, Put, Patch, Delete,
	OnModuleInit,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ApiOperation, ApiTags, ApiProduces, ApiConsumes, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { Logger } from 'winston';
import authSwaggerDecorator from '@api/decorators/authSwagger.decorator';
import UserEntity, { UserEntityList, UserInterface } from '@app/domain/entities/User.entity';
import UserOperation from '@app/operations/User.operation';
import { ListQueryPipeDto, ListQueryPipeValidator } from '@api/pipes/QueryValidator.pipe';
import { CreateUserPipeDto, CreateUserPipeValidator, UpdateUserPipeDto, UpdateUserPipeValidator, LoginUserPipeValidator, LoginUserPipeDto } from '@api/pipes/UserValidator.pipe';
import LoggerGenerator from '@core/infra/logging/LoggerGenerator.logger';
import { PaginationInterface } from 'src/types/listPaginationInterface';
import { RequestInterface } from 'src/types/endpointInterface';


@ApiTags('Users')
@Controller('/users')
@authSwaggerDecorator()
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

	@ApiOperation({ summary: 'List Users' })
	@Get()
	@ApiOkResponse({
		type: UserEntityList,
		schema: {
			example: (new UserEntityList()),
		},
	})
	@ApiConsumes('application/json')
	@ApiProduces('application/json')
	public async listUsers(
		@Query(ListQueryPipeValidator) query: ListQueryPipeDto,
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
	@Post()
	@ApiCreatedResponse({ type: UserEntity })
	@ApiConsumes('application/json')
	@ApiProduces('application/json')
	public async createUser(
		@Req() request: RequestInterface,
		@Body(CreateUserPipeValidator) body: CreateUserPipeDto,
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

	@ApiOperation({ summary: 'Get User' })
	@Get('/:userId')
	@ApiOkResponse({ type: UserEntity })
	@ApiConsumes('application/json')
	@ApiProduces('application/json')
	public async getUser(
		@Req() request: RequestInterface,
		@Param('userId') userId: number,
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

	@ApiOperation({ summary: 'Login User' })
	@Put()
	@ApiOkResponse({ type: UserEntity })
	@ApiConsumes('application/json')
	@ApiProduces('application/json')
	public async loginUser(
		@Req() request: RequestInterface,
		@Body(LoginUserPipeValidator) body: LoginUserPipeDto,
	): Promise<UserInterface> {
		try {
			const { user } = request;

			const result = await this.userOperation.loginUser(body, user);

			return result.getAttributes();
		} catch (error) {
			this.logger.error(error);
			throw error;
		}
	}

	@ApiOperation({ summary: 'Update User' })
	@Patch('/:userId')
	@ApiOkResponse({ type: UserEntity })
	@ApiConsumes('application/json')
	@ApiProduces('application/json')
	public async updateUser(
		@Req() request: RequestInterface,
		@Param('userId', ParseIntPipe) userId: number,
		@Body(UpdateUserPipeValidator) body: UpdateUserPipeDto,
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

	@ApiOperation({ summary: 'Delete User' })
	@Delete('/:userId')
	@ApiOkResponse({ schema: { example: { result: true } } })
	@ApiConsumes('application/json')
	@ApiProduces('application/json')
	public async deleteUser(
		@Req() request: RequestInterface,
		@Param('userId') userId: number,
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
