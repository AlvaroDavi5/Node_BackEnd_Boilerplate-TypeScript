import {
	Controller, Request, ParseIntPipe,
	Param, Query, Body,
	Get, Post, Patch, Delete,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ApiOperation, ApiTags, ApiProduces, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import authSwaggerDecorator from '@api/decorators/authSwagger.decorator';
import UserEntity, { UserEntityList } from '@app/domain/entities/User.entity';
import UserOperation from '@app/operations/User.operation';
import { ListQueryPipeModel, ListQueryPipeValidator } from '@api/pipes/QueryValidator.pipe';
import { CreateUserPipeModel, CreateUserPipeValidator, UpdateUserPipeModel, UpdateUserPipeValidator } from '@api/pipes/UserValidator.pipe';
import { PaginationInterface } from 'src/types/_listPaginationInterface';
import { RequestInterface } from 'src/types/_endpointInterface';


@ApiTags('Users')
@Controller('/users')
@authSwaggerDecorator()
export default class UserController {
	private readonly userOperation: UserOperation;

	constructor(
		private readonly moduleRef: ModuleRef,
	) {
		this.userOperation = this.moduleRef.get(UserOperation, { strict: false });
	}

	@ApiOperation({ summary: 'List Users' })
	@Get()
	@ApiOkResponse({
		type: UserEntityList, schema: {
			example: (new UserEntityList()),
		}
	})
	@ApiProduces('application/json')
	public async listUsers(
		@Query(ListQueryPipeValidator) query: ListQueryPipeModel,
	): Promise<PaginationInterface<UserEntity> | unknown> {
		try {
			const result = await this.userOperation.listUsers(query);
			return result;
		} catch (error) {
			return error;
		}
	}

	@ApiOperation({ summary: 'Create User' })
	@Post()
	@ApiCreatedResponse({ type: UserEntity })
	@ApiProduces('application/json')
	public async createUser(
		@Request() request: RequestInterface,
		@Body(CreateUserPipeValidator) body: CreateUserPipeModel,
	): Promise<UserEntity | unknown> {
		try {
			const { user } = request;

			const result = await this.userOperation.createUser(body, user);
			return result;
		} catch (error) {
			return error;
		}
	}

	@ApiOperation({ summary: 'Get User' })
	@Get('/:userId')
	@ApiOkResponse({ type: UserEntity })
	@ApiProduces('application/json')
	public async getUser(
		@Request() request: RequestInterface,
		@Param('userId') userId: number,
	): Promise<UserEntity | unknown> {
		try {
			const { user } = request;

			const result = await this.userOperation.getUser(userId, user);
			return result;
		} catch (error) {
			return error;
		}
	}

	@ApiOperation({ summary: 'Update User' })
	@Patch('/:userId')
	@ApiOkResponse({ type: UserEntity })
	@ApiProduces('application/json')
	public async updateUser(
		@Request() request: RequestInterface,
		@Param('userId', ParseIntPipe) userId: number,
		@Body(UpdateUserPipeValidator) body: UpdateUserPipeModel,
	): Promise<UserEntity | unknown> {
		try {
			const { user } = request;

			const result = await this.userOperation.updateUser(userId, body, user);
			return result;
		} catch (error) {
			return error;
		}
	}

	@ApiOperation({ summary: 'Delete User' })
	@Delete('/:userId')
	@ApiOkResponse({ schema: { example: { result: true } } })
	@ApiProduces('application/json')
	public async deleteUser(
		@Request() request: RequestInterface,
		@Param('userId') userId: number,
	): Promise<[affectedCount: number] | unknown> {
		try {
			const { user } = request;

			const result = await this.userOperation.deleteUser(userId, user);
			return { result };
		} catch (error) {
			return error;
		}
	}
}
