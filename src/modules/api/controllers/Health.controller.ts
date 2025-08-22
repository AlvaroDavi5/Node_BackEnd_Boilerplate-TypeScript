import {
	Controller, Req, Res, Version,
	Sse, Get, Headers, Param, Query, Body,
	UseGuards, UseFilters, UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiProduces, ApiConsumes, ApiOkResponse } from '@nestjs/swagger';
import { interval, map, Observable } from 'rxjs';
import exceptionsResponseDecorator from '@api/decorators/exceptionsResponse.decorator';
import HttpExceptionsFilter from '@api/filters/HttpExceptions.filter';
import ResponseInterceptor from '@api/interceptors/Response.interceptor';
import CustomThrottlerGuard from '@common/guards/CustomThrottler.guard';
import HttpMessagesConstants from '@common/constants/HttpMessages.constants';
import { ApiVersionsEnum } from '@common/enums/apiVersions.enum';
import type { RequestInterface, ResponseInterface } from '@shared/internal/interfaces/endpointInterface';


@ApiTags('HealthCheck')
@Controller('/check')
@UseGuards(CustomThrottlerGuard)
@UseFilters(HttpExceptionsFilter)
@UseInterceptors(ResponseInterceptor)
@exceptionsResponseDecorator()
export default class HealthController {
	constructor(
		private readonly httpMessagesConstants: HttpMessagesConstants,
	) { }

	@ApiOperation({
		summary: 'Check API',
		description: 'Check if API is working',
		deprecated: false,
	})
	@Get()
	@Version(ApiVersionsEnum.DEFAULT)
	@ApiOkResponse({
		schema: {
			example: {
				baseUrl: '/',
				url: '/api/check?test=oi',
				method: 'GET',
				headers: { host: 'localhost:3000', connection: 'keep-alive', accept: 'application/json' },
				params: { id: 1 },
				query: { key: 'value' },
				body: { payload: {} },
				statusCode: 200,
				statusMessage: 'Endpoint founded successfully.',
			},
		}
	})
	@ApiConsumes('application/json')
	@ApiProduces('application/json')
	public healthCheck(
		@Req() request: RequestInterface,
		@Headers() headers: Record<string, string | undefined>,
		@Param() pathParams: Record<string, unknown>,
		@Query() queryParams: unknown,
		@Body() body: unknown,
		@Res({ passthrough: true }) response: ResponseInterface,
	): {
		baseUrl: string, url: string, method: string,
		headers: Record<string, string | undefined>,
		pathParams: Record<string, unknown>, queryParams: unknown, body: unknown,
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
			pathParams,
			queryParams,
			body,
			statusCode: response.statusCode,
			statusMessage: response.statusMessage ?? this.httpMessagesConstants.messages.found('Endpoint'),
		};
	}

	@ApiOperation({
		summary: 'Check API',
		description: 'Check if API is working (v1)',
		deprecated: true,
	})
	@Get()
	@Version(ApiVersionsEnum.V1)
	@ApiOkResponse({
		schema: {
			example: 'OK',
		}
	})
	@ApiConsumes('text/plain')
	@ApiProduces('text/plain')
	public healthCheckV1(): string {
		return 'OK';
	}

	@ApiOperation({
		summary: 'Server-Sent Events',
		description: 'Send to Client the Server events',
		deprecated: false,
	})
	@Sse('sse')
	@Version(ApiVersionsEnum.DEFAULT)
	@ApiOkResponse({
		schema: {
			example: { number: 1, text: 'OK' },
		}
	})
	@ApiConsumes('text/plain')
	@ApiProduces('text/event-stream')
	sse(): Observable<Partial<MessageEvent<{ number: number, text: string }>>> {
		return interval(1000).pipe(map<number, Partial<MessageEvent<{ number: number, text: string }>>>((n) => ({
			data: { number: n, text: 'OK' },
		})));
	}
}
