import {
	Controller, Req, Res,
	Get, Post, Headers, UseInterceptors, UseGuards, UseFilters, StreamableFile,
	BadRequestException
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBody, ApiHeaders, ApiProduces, ApiConsumes, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import FileService from '@app/file/services/File.service';
import AuthGuard from '@api/guards/Auth.guard';
import HttpExceptionsFilter from '@api/filters/HttpExceptions.filter';
import ResponseInterceptor from '@api/interceptors/Response.interceptor';
import authSwaggerDecorator from '@api/decorators/authSwagger.decorator';
import exceptionsResponseDecorator from '@api/decorators/exceptionsResponse.decorator';
import CustomThrottlerGuard from '@common/guards/CustomThrottler.guard';
import type { RequestInterface, ResponseInterface } from '@shared/internal/interfaces/endpointInterface';


@ApiTags('Files')
@Controller('/files')
@UseGuards(CustomThrottlerGuard, AuthGuard)
@UseFilters(HttpExceptionsFilter)
@UseInterceptors(ResponseInterceptor)
@authSwaggerDecorator()
@exceptionsResponseDecorator()
export default class FileController {
	constructor(
		private readonly fileService: FileService,
	) { }

	@ApiOperation({
		summary: 'Download File',
		description: 'Download Uploaded File',
		deprecated: false,
	})
	@Get('/download')
	@ApiOkResponse({
		schema: {
			example: 'MIT License Copyright (c) 2022 ...',
		},
		description: 'Downloadable file',
	})
	@ApiConsumes('application/json')
	@ApiProduces('application/octet-stream', 'text/plain')
	@ApiHeaders([
		{ name: 'accept', allowEmptyValue: true },
	])
	public async downloadFile(
		@Headers() headers: Record<string, string | undefined>,
		@Headers('fileName') fileNameHeader: string,
		@Headers('filePath') filePathHeader: string,
		@Res({ passthrough: true }) response: ResponseInterface,
	): Promise<Buffer | StreamableFile | string> {
		if (!fileNameHeader || !filePathHeader) {
			throw new BadRequestException('"fileName" and "filePath" headers are required');
		}

		const { content, contentType, fileName } = await this.fileService.downloadFile(fileNameHeader, filePathHeader, headers.accept);

		response.headers({
			'Content-Type': contentType,
			'Content-Disposition': `attachment; filename="${fileName}"`,
		});

		return content;
	}

	@ApiOperation({
		summary: 'Upload File',
		description: 'Upload any file to S3',
		deprecated: false,
	})
	@Post('/upload')
	@ApiCreatedResponse({
		schema: {
			example: {
				filePath: 'upload/reports/file.txt',
				fileContentType: 'text/plain',
				uploadTag: '"d41d8cd98f00b204e9801998ecf8427e"',
			},
		},
		description: 'Uploaded File Info',
	})
	@ApiConsumes('multipart/form-data')
	@ApiProduces('application/json')
	@ApiHeaders([
		{ name: 'accept', allowEmptyValue: true },
	])
	@ApiBody({
		required: true,
		schema: {
			type: 'object',
			properties: {
				file: {
					type: 'string',
					format: 'binary',
				},
			},
		},
	})
	public async uploadFile(
		@Headers() headers: Record<string, string | undefined>,
		@Headers('fileName') fileNameHeader: string | undefined,
		@Req() request: RequestInterface,
	): Promise<{
		filePath: string,
		fileContentType: string,
		uploadTag: string | null,
	}> {
		const file = await request.file();
		if (!file) {
			throw new BadRequestException('File is required');
		}
		if (!fileNameHeader) {
			throw new BadRequestException('"fileName" header is required');
		}

		return await this.fileService.uploadFile(file, fileNameHeader, headers.accept);
	}
}
