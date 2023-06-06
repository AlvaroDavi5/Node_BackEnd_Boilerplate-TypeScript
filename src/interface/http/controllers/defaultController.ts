import {
	Controller, Req, Res,
	Get, Param, Query, Body,
} from '@nestjs/common';
import { Request, Response } from 'express';
import HttpConstants from 'src/interface/http/constants/httpConstants';

@Controller()
export default class DefaultController {
	constructor(
		private readonly httpConstants: HttpConstants,
	) { }

	@Get('/check')
	healthCheck(
		@Req() request: Request,
		@Param() params: any,
		@Query() query: any,
		@Body() body: any,
		@Res({ passthrough: true }) response: Response
	): Response<any> {
		// [METHOD]:CODE http://url/:param1/:param2?query1=X&query2=Y { "body": {} }

		return response
			.status(this.httpConstants.status.OK)
			.json({
				url: request?.url,
				statusCode: request?.statusCode || 200,
				method: request?.method,
				params: params,
				query: query,
				body: body,
			});
	}
}