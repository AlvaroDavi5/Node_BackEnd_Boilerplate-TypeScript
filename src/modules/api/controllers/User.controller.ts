import {
	Controller, Request, ParseIntPipe,
	Param, Query, Body,
	Get, Post, Patch, Delete,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import authSwaggerDecorator from '@api/decorators/authSwagger.decorator';
import UserEntity, { UserEntityList } from '@app/domain/entities/User.entity';
import UserOperation from '@app/operations/User.operation';
import UserOperationAdapter from '@common/adapters/UserOperation.adapter';
import { ListQueryValidatorPipe } from '@api/pipes/QueryValidator.pipe';
import { CreateUserValidatorPipe, UpdateUserValidatorPipe } from '@api/pipes/UserValidator.pipe';
import { UpdateUserSchemaInterface } from '../schemas/user/updateUser.schema';
import { CreateUserSchemaInterface } from '../schemas/user/createUser.schema';
import { RequestInterface } from 'src/types/_endpointInterface';
import { ListQueryInterface, PaginationInterface } from 'src/types/_listPaginationInterface';


@ApiTags('Users')
@authSwaggerDecorator()
@Controller('/users')
export default class UserController {
	private readonly userOperation: UserOperation;

	constructor(
		private readonly userOperationAdapter: UserOperationAdapter,
	) {
		this.userOperation = this.userOperationAdapter.getProvider();
	}

	@ApiOperation({ summary: 'List Users' })
	@ApiOkResponse({
		type: UserEntityList, schema: {
			example: (new UserEntityList()),
		}
	})
	@Get()
	public async listUsers(
		@Query(ListQueryValidatorPipe) query: ListQueryInterface,
	): Promise<PaginationInterface<UserEntity> | unknown> {
		try {
			const result = await this.userOperation.listUsers(query);
			return result;
		} catch (error) {
			return error;
		}
	}

	@ApiOperation({ summary: 'Create User' })
	@ApiCreatedResponse({ type: UserEntity })
	@Post()
	public async createUser(
		@Request() request: RequestInterface,
		@Body(CreateUserValidatorPipe) body: CreateUserSchemaInterface,
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
	@ApiOkResponse({ type: UserEntity })
	@Get('/:userId')
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
	@ApiOkResponse({ type: UserEntity })
	@Patch('/:userId')
	public async updateUser(
		@Request() request: RequestInterface,
		@Param('userId', ParseIntPipe) userId: number,
		@Body(UpdateUserValidatorPipe) body: UpdateUserSchemaInterface,
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
	@ApiOkResponse({ type: Number, schema: { example: 1 } })
	@Delete('/:userId')
	public async deleteUser(
		@Request() request: RequestInterface,
		@Param('userId') userId: number,
	): Promise<[affectedCount: number] | unknown> {
		try {
			const { user } = request;

			const result = await this.userOperation.deleteUser(userId, user);
			return result;
		} catch (error) {
			return error;
		}
	}
}
