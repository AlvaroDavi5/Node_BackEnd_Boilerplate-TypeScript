import {
	Controller, Req, Res,
	Get, Param, Query, Body,
	StreamableFile,
	OnModuleInit,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ApiOperation, ApiTags, ApiProduces, ApiOkResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ReadStream } from 'fs';
import ContentTypeConstants from '@api/constants/ContentType.constants';
import FileReaderHelper from '@common/utils/helpers/FileReader.helper';


@Controller()
export default class DefaultController implements OnModuleInit {
	private fileReaderHelper!: FileReaderHelper;
	private readonly contentTypeConstants: ContentTypeConstants;

	constructor(
		private readonly moduleRef: ModuleRef,
	) {
		this.contentTypeConstants = new ContentTypeConstants();
	}

	public onModuleInit(): void {
		this.fileReaderHelper = this.moduleRef.get(FileReaderHelper, { strict: false });
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
			const readStream = this.fileReaderHelper.readStream('src/dev/templates/LICENSE.txt');

			if (readStream)
				response.set({
					'Content-Type': acceptableContentType.includes(expectedContentType) ? expectedContentType : plainTextContentType,
					'Content-Disposition': 'attachment; filename="LICENSE.txt"',
				});

			return new StreamableFile(readStream as ReadStream);
		} catch (error) {
			return error;
		}
	}
}
