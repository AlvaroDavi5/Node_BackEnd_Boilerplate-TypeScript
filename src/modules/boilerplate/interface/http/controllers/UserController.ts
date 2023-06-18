import {
	Controller, Req, Res, UsePipes,
	Get, Post, Put, Delete, Param, Query, Body,
} from '@nestjs/common';
import { Response } from 'express';
import UserOperation from '@modules/boilerplate/app/operations/UserOperation';
import HttpConstants from '@modules/boilerplate/interface/http/constants/HttpConstants';
import { CreateUserValidatorPipe, UpdateUserValidatorPipe } from '@modules/boilerplate/interface/http/pipes/UserValidatorPipe';
import { RequestInterface } from 'src/types/_endpointInterface';


@Controller()
export default class UserController {
	constructor(
		private readonly userOperation: UserOperation,
		private readonly httpConstants: HttpConstants,
	) { }

	@Get('/users')
	async listUsers(
		@Query() query: any,
		@Res({ passthrough: true }) response: Response,
	): Promise<Response<any>> {
		try {
			const result = await this.userOperation.listUsers(query);

			return response
				.status(this.httpConstants.status.OK)
				.json(result);
		} catch (error: unknown) {
			return response.status(this.httpConstants.status.INTERNAL_SERVER_ERROR).json(error);
		}
	}

	@Post('/users')
	@UsePipes(CreateUserValidatorPipe)
	async createUser(
		@Req() request: RequestInterface,
		@Body() body: any,
		@Res({ passthrough: true }) response: Response,
	): Promise<Response<any>> {
		try {
			const { user } = request;

			const result = await this.userOperation.createUser(body, user);

			return response
				.status(this.httpConstants.status.OK)
				.json(result);
		} catch (error: unknown) {
			return response.status(this.httpConstants.status.INTERNAL_SERVER_ERROR).json(error);
		}
	}

	@Get('/users/:userId')
	async getUser(
		@Req() request: RequestInterface,
		@Param('userId') userId: number,
		@Res({ passthrough: true }) response: Response,
	): Promise<Response<any>> {
		try {
			const { user } = request;

			const result = await this.userOperation.getUser(userId, user);

			return response
				.status(this.httpConstants.status.OK)
				.json(result);
		} catch (error: unknown) {
			return response.status(this.httpConstants.status.INTERNAL_SERVER_ERROR).json(error);
		}
	}

	@Put('/users/:userId')
	@UsePipes(UpdateUserValidatorPipe)
	async updateUser(
		@Req() request: RequestInterface,
		@Param('userId') userId: number,
		@Body() body: any,
		@Res({ passthrough: true }) response: Response,
	): Promise<Response<any>> {
		try {
			const { user } = request;

			const result = await this.userOperation.updateUser(userId, body, user);

			return response
				.status(this.httpConstants.status.OK)
				.json(result);
		} catch (error: unknown) {
			return response.status(this.httpConstants.status.INTERNAL_SERVER_ERROR).json(error);
		}
	}

	@Delete('/users/:userId')
	async deleteUser(
		@Req() request: RequestInterface,
		@Param('userId') userId: number,
		@Res({ passthrough: true }) response: Response,
	): Promise<Response<any>> {
		try {
			const { user } = request;

			const result = await this.userOperation.deleteUser(userId, user);

			return response
				.status(this.httpConstants.status.OK)
				.json(result);
		} catch (error: unknown) {
			return response.status(this.httpConstants.status.INTERNAL_SERVER_ERROR).json(error);
		}
	}
}
