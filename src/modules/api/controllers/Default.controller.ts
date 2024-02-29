import {
	Controller, Req, Res,
	Get, Headers, Param, Query, Body,
	UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiProduces, ApiConsumes, ApiOkResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import exceptionsResponseDecorator from '@api/decorators/exceptionsResponse.decorator';
import HttpConstants from '@api/constants/Http.constants';
import CustomThrottlerGuard from '@api/guards/Throttler.guard';


@Controller()
@UseGuards(CustomThrottlerGuard)
@exceptionsResponseDecorator()
export default class DefaultController {
	constructor(
		private readonly httpConstants: HttpConstants,
	) { }

	@ApiTags('HealthCheck')
	@ApiOperation({
		summary: 'Check API',
		description: 'Check if API is working',
		deprecated: false,
	})
	@Get('/check')
	@ApiOkResponse({
		schema: {
			example: {
				baseUrl: '/',
				url: '/api/check?test=oi',
				method: 'GET',
				headers: {
					host: 'localhost:3000',
					connection: 'keep-alive',
					accept: 'application/json',
				},
				params: {
					id: 1,
				},
				query: {
					key: 'value',
				},
				body: {},
				statusCode: 200,
				statusMessage: 'Endpoint finded successfully.',
			},
		}
	})
	@ApiConsumes('application/json')
	@ApiProduces('application/json')
	public healthCheck(
		@Req() request: Request,
		@Headers() headers: { [key: string]: string | undefined },
		@Param() params: { [key: string]: unknown },
		@Query() query: unknown,
		@Body() body: unknown,
		@Res({ passthrough: true }) response: Response,
	): {
		baseUrl: string, url: string, method: string,
		headers: { [key: string]: string | undefined }, params: { [key: string]: unknown },
		query: unknown, body: unknown,
		statusCode: number, statusMessage: string,
	} {
		// [METHOD]:{STATUS_CODE} http://url/:param1/:param2?query1=X&query2=Y { 'body': {} }

		return {
			baseUrl: request?.baseUrl,
			url: request?.url,
			method: request?.method,
			headers: {
				host: headers.host,
				connection: headers.connection,
				accept: headers.accept,
			},
			params: params,
			query: query,
			body: body,
			statusCode: response.statusCode,
			statusMessage: response.statusMessage ?? this.httpConstants.messages.found('Endpoint'),
		};
	}
}
