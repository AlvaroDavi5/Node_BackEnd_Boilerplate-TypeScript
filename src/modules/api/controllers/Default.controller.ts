import {
	Controller, Req, Res,
	Get, Param, Query, Body,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';


@ApiTags('HealthCheck')
@Controller()
export default class DefaultController {

	@ApiOperation({ summary: 'Check API' })
	@Get('/check')
	@ApiOkResponse({
		schema: {
			example: {
				baseUrl: '/',
				url: '/api/check?test=oi',
				statusCode: 200,
				statusMessage: 'OK',
				method: 'GET',
				params: {
					id: 1,
				},
				query: {
					key: 'value',
				},
				body: {},
			}
		}
	})
	public healthCheck(
		@Req() request: Request,
		@Param() params: { [key: string]: unknown },
		@Query() query: unknown,
		@Body() body: unknown,
		@Res({ passthrough: true }) response: Response,
	): {
		baseUrl: string, url: string,
		statusCode: number, statusMessage: string,
		method: string, params: { [key: string]: unknown },
		query: unknown, body: unknown,
	} {
		// [METHOD]:{STATUS_CODE} http://url/:param1/:param2?query1=X&query2=Y { "body": {} }

		return {
			baseUrl: request?.baseUrl,
			url: request?.url,
			statusCode: response?.statusCode || 200,
			statusMessage: response?.statusMessage || 'OK',
			method: request?.method,
			params: params,
			query: query,
			body: body,
		};
	}
}
