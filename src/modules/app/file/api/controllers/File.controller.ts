import {
	Inject,
	Controller, Res,
	Get, Post, Headers,
	UseInterceptors, UseGuards,
	UploadedFile, StreamableFile, ParseFilePipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBody, ApiHeaders, ApiProduces, ApiConsumes, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer as _Multer } from 'multer';
import { Response } from 'express';
import LoggerService, { REQUEST_LOGGER_PROVIDER } from '@core/logging/Logger.service';
import CustomThrottlerGuard from '@api/guards/Throttler.guard';
import AuthGuard from '@api/guards/Auth.guard';
import authSwaggerDecorator from '@api/decorators/authSwagger.decorator';
import exceptionsResponseDecorator from '@api/decorators/exceptionsResponse.decorator';
import FileService from '@app/file/services/File.service';


@ApiTags('Files')
@Controller('/files')
@UseGuards(CustomThrottlerGuard, AuthGuard)
@authSwaggerDecorator()
@exceptionsResponseDecorator()
export default class FileController {
	constructor(
		private readonly fileService: FileService,
		@Inject(REQUEST_LOGGER_PROVIDER)
		private readonly logger: LoggerService,
	) {
		this.logger.setContextName(FileController.name);
	}

	@ApiOperation({
		summary: 'Download File',
		description: 'Download Uploaded File',
		deprecated: false,
	})
	@Get('/download')
	@ApiOkResponse({
		schema: {
			example: 'MIT License Copyright (c) 2022 Álvaro Alves <alvaro.davisa@gmail.com> ...',
		},
		description: 'Downloadable file',
	})
	@ApiConsumes('application/json')
	@ApiProduces('application/octet-stream', 'text/plain')
	@ApiHeaders([
		{ name: 'accept', allowEmptyValue: true },
	])
	public async downloadFile(
		@Headers() headers: { [key: string]: string | undefined },
		@Headers('fileName') fileNameHeader: string,
		@Headers('filePath') filePathHeader: string,
		@Res({ passthrough: true }) response: Response,
	): Promise<Buffer | StreamableFile | string> {
		const { content, contentType, fileName } = await this.fileService.downloadFile(fileNameHeader, filePathHeader, headers.accept);

		response.set({
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
	@UseInterceptors(FileInterceptor('file', { dest: './temp', preservePath: true, limits: {} }))
	public async uploadFile(
		@Headers() headers: { [key: string]: string | undefined },
		@Headers('fileName') fileNameHeader: string,
		@UploadedFile(new ParseFilePipe()) file: Express.Multer.File,
	): Promise<{
		filePath: string,
		fileContentType: string,
		uploadTag: string,
	}> {
		return await this.fileService.uploadFile(file, fileNameHeader, headers.accept);
	}
}
