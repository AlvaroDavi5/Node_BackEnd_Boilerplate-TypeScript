import {
	Controller, Req, Res, Version,
	Get, Headers, Param, Query, Body,
	UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiProduces, ApiConsumes, ApiOkResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import exceptionsResponseDecorator from '@api/decorators/exceptionsResponse.decorator';
import HttpConstants from '@common/constants/Http.constants';
import CustomThrottlerGuard from '@api/guards/Throttler.guard';
import { ApiVersionsEnum } from '@common/enums/apiVersions.enum';


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
	@Version(ApiVersionsEnum.DEFAULT)
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
				statusMessage: 'Endpoint founded successfully.',
			},
		}
	})
	@ApiConsumes('application/json')
	@ApiProduces('application/json')
	public healthCheck(
		@Req() request: Request,
		@Headers() headers: { [key: string]: string | undefined },
		@Param() pathParams: { [key: string]: unknown },
		@Query() queryParams: unknown,
		@Body() body: unknown,
		@Res({ passthrough: true }) response: Response,
	): {
		baseUrl: string, url: string, method: string,
		headers: { [key: string]: string | undefined },
		pathParams: { [key: string]: unknown }, queryParams: unknown, body: unknown,
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
			pathParams: pathParams,
			queryParams: queryParams,
			body: body,
			statusCode: response.statusCode,
			statusMessage: response.statusMessage ?? this.httpConstants.messages.found('Endpoint'),
		};
	}

	@ApiTags('HealthCheck')
	@ApiOperation({
		summary: 'Check API',
		description: 'Check if API is working (v1)',
		deprecated: true,
	})
	@Get('/check')
	@Version(ApiVersionsEnum.V1)
	@ApiOkResponse({
		schema: {
			example: {
				baseUrl: '/',
				method: 'GET',
				statusCode: 200,
			},
		}
	})
	@ApiConsumes('application/json')
	@ApiProduces('application/json')
	public healthCheckV1(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
	): {
		baseUrl: string, method: string,
		statusCode: number,
	} {
		return {
			baseUrl: request?.baseUrl,
			method: request?.method,
			statusCode: response.statusCode,
		};
	}
}
