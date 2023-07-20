import {
	Controller, Req, UsePipes,
	Get, Post, Put, Delete, Param, Query, Body,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import authSwaggerDecorator from '@modules/api/decorators/authSwagger.decorator';
import UserOperation from '@modules/app/operations/User.operation';
import { CreateUserValidatorPipe, UpdateUserValidatorPipe } from '@modules/api/pipes/UserValidator.pipe';
import { RequestInterface } from 'src/types/_endpointInterface';
import UserEntity from '@modules/app/domain/entities/User.entity';


@ApiTags('Users')
@authSwaggerDecorator()
@Controller('/users')
export default class UserController {
	constructor(
		private readonly userOperation: UserOperation,
	) { }

	@ApiOperation({ summary: 'List Users' })
	@ApiOkResponse({
		type: Object, schema: {
			example: {
				content: [],
				pageNumber: 0,
				pageSize: 0,
				totalPages: 0,
				totalItems: 0,
			}
		}
	})
	@Get()
	public async listUsers(
		@Query() query: any,
	): Promise<any | unknown> {
		try {
			const result = await this.userOperation.listUsers(query);
			return result;
		} catch (error: unknown) {
			return error;
		}
	}

	@ApiOperation({ summary: 'Create User' })
	@ApiOkResponse({ type: UserEntity })
	@Post()
	@UsePipes(CreateUserValidatorPipe)
	public async createUser(
		@Req() request: RequestInterface,
		@Body() body: any,
	): Promise<UserEntity | unknown> {
		try {
			const { user } = request;

			const result = await this.userOperation.createUser(body, user);
			return result;
		} catch (error: unknown) {
			return error;
		}
	}

	@ApiOperation({ summary: 'Get User' })
	@ApiOkResponse({ type: UserEntity })
	@Get('/:userId')
	public async getUser(
		@Req() request: RequestInterface,
		@Param('userId') userId: number,
	): Promise<UserEntity | unknown> {
		try {
			const { user } = request;

			const result = await this.userOperation.getUser(userId, user);
			return result;
		} catch (error: unknown) {
			return error;
		}
	}

	@ApiOperation({ summary: 'Update User' })
	@ApiOkResponse({ type: UserEntity })
	@Put('/:userId')
	@UsePipes(UpdateUserValidatorPipe)
	public async updateUser(
		@Req() request: RequestInterface,
		@Param('userId') userId: number,
		@Body() body: any,
	): Promise<UserEntity | unknown> {
		try {
			const { user } = request;

			const result = await this.userOperation.updateUser(userId, body, user);
			return result;
		} catch (error: unknown) {
			return error;
		}
	}

	@ApiOperation({ summary: 'Delete User' })
	@ApiOkResponse({ type: Number, schema: { example: 1 } })
	@Delete('/:userId')
	public async deleteUser(
		@Req() request: RequestInterface,
		@Param('userId') userId: number,
	): Promise<[affectedCount: number] | unknown> {
		try {
			const { user } = request;

			const result = await this.userOperation.deleteUser(userId, user);
			return result;
		} catch (error: unknown) {
			return error;
		}
	}
}
