import {
	Controller, Req, Res,
	Get, Param, Query, Body,
	StreamableFile,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiProduces, ApiOkResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';
import ContentTypeConstants from '@api/constants/ContentType.constants';


@Controller()
export default class DefaultController {
	private readonly contentTypeConstants: ContentTypeConstants;

	constructor() {
		this.contentTypeConstants = new ContentTypeConstants();
	}

	@ApiTags('HealthCheck')
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
	@ApiProduces('application/json')
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
		// [METHOD]:{STATUS_CODE} http://url/:param1/:param2?query1=X&query2=Y { 'body': {} }

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

	@ApiTags('Files')
	@ApiOperation({ summary: 'Download License' })
	@Get('/license')
	@ApiOkResponse({
		schema: {
			example: 'MIT License Copyright (c) 2022 Álvaro Alves <alvaro.davisa@gmail.com> ...',
		},
		description: 'Downloadable file',
	})
	@ApiProduces('application/octet-stream', 'text/plain')
	public getLicense(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
	): StreamableFile | unknown {
		const { application: { OCTET_STREAM: streamContentType }, text: { PLAIN: plainTextContentType } } = this.contentTypeConstants;
		const acceptableContentType = [streamContentType, plainTextContentType];
		const expectedContentType = request.headers.accept || '';

		try {
			const file = join(process.cwd(), 'src/dev/templates/LICENSE.txt');
			const readStream = createReadStream(file);

			response.set({
				'Content-Type': acceptableContentType.includes(expectedContentType) ? expectedContentType : plainTextContentType,
				'Content-Disposition': 'attachment; filename="LICENSE.txt"',
			});

			return new StreamableFile(readStream);
		} catch (error) {
			return error;
		}
	}
}
