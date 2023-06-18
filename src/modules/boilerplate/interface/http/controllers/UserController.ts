import {
	Controller, Req, UsePipes,
	Get, Post, Put, Delete, Param, Query, Body,
} from '@nestjs/common';
import UserOperation from '@modules/boilerplate/app/operations/UserOperation';
import { CreateUserValidatorPipe, UpdateUserValidatorPipe } from '@modules/boilerplate/interface/http/pipes/UserValidatorPipe';
import { RequestInterface } from 'src/types/_endpointInterface';


@Controller()
export default class UserController {
	constructor(
		private readonly userOperation: UserOperation,
	) { }

	@Get('/users')
	async listUsers(
		@Query() query: any,
	): Promise<any> {
		try {
			const result = await this.userOperation.listUsers(query);
			return result;
		} catch (error: unknown) {
			return error;
		}
	}

	@Post('/users')
	@UsePipes(CreateUserValidatorPipe)
	async createUser(
		@Req() request: RequestInterface,
		@Body() body: any,
	): Promise<any> {
		try {
			const { user } = request;

			const result = await this.userOperation.createUser(body, user);
			return result;
		} catch (error: unknown) {
			return error;
		}
	}

	@Get('/users/:userId')
	async getUser(
		@Req() request: RequestInterface,
		@Param('userId') userId: number,
	): Promise<any> {
		try {
			const { user } = request;

			const result = await this.userOperation.getUser(userId, user);
			return result;
		} catch (error: unknown) {
			return error;
		}
	}

	@Put('/users/:userId')
	@UsePipes(UpdateUserValidatorPipe)
	async updateUser(
		@Req() request: RequestInterface,
		@Param('userId') userId: number,
		@Body() body: any,
	): Promise<any> {
		try {
			const { user } = request;

			const result = await this.userOperation.updateUser(userId, body, user);
			return result;
		} catch (error: unknown) {
			return error;
		}
	}

	@Delete('/users/:userId')
	async deleteUser(
		@Req() request: RequestInterface,
		@Param('userId') userId: number,
	): Promise<any> {
		try {
			const { user } = request;

			const result = await this.userOperation.deleteUser(userId, user);
			return result;
		} catch (error: unknown) {
			return error;
		}
	}
}
