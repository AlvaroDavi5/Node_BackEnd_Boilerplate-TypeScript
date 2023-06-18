import {
	Controller, Req, Res,
	Get, Param, Query, Body,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Controller()
export default class DefaultController {
	constructor(
	) { }

	@Get('/check')
	healthCheck(
		@Req() request: Request,
		@Param() params: string[],
		@Query() query: object,
		@Body() body: object,
		@Res({ passthrough: true }) response: Response
	): any {
		// [METHOD]:{STATUS_CODE} http://url/:param1/:param2?query1=X&query2=Y { "body": {} }

		return {
			baseUrl: request?.baseUrl,
			method: request?.method,
			statusCode: request?.statusCode || 200,
			statusMessage: response?.statusMessage,
			params: params,
			query: query,
			body: body,
			url: request?.url,
		};
	}
}
