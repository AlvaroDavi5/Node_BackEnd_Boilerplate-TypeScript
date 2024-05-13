import {
	OnModuleInit, Inject,
	Controller, Res,
	Get, Post, Headers,
	UseInterceptors, UseGuards,
	UploadedFile, StreamableFile, ParseFilePipe,
} from '@nestjs/common';
import { LazyModuleLoader } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags, ApiBody, ApiHeaders, ApiProduces, ApiConsumes, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Logger } from 'winston';
import { Multer } from 'multer';
import { Response } from 'express';
import { Readable } from 'stream';
import authSwaggerDecorator from '@api/decorators/authSwagger.decorator';
import exceptionsResponseDecorator from '@api/decorators/exceptionsResponse.decorator';
import CustomThrottlerGuard from '@api/guards/Throttler.guard';
import AuthGuard from '@api/guards/Auth.guard';
import ContentTypeConstants from '@common/constants/ContentType.constants';
import { LOGGER_PROVIDER, LoggerProviderInterface } from '@core/logging/Logger.provider';
import ReportsModule from '@app/reports/reports.module';
import UploadService from '@app/reports/services/Upload.service';
import { EnvironmentsEnum } from '@common/enums/environments.enum';
import { ConfigsInterface } from '@core/configs/configs.config';
import CryptographyService from '@core/security/Cryptography.service';


@ApiTags('Files')
@Controller('/files')
@UseGuards(CustomThrottlerGuard, AuthGuard)
@authSwaggerDecorator()
@exceptionsResponseDecorator()
export default class FileController implements OnModuleInit {
	private uploadService!: UploadService;
	private readonly logger: Logger;
	private readonly isTestEnv: boolean; // ! lazy loads not works in test environment

	constructor(
		private readonly lazyModuleLoader: LazyModuleLoader,
		private readonly configService: ConfigService,
		private readonly cryptographyService: CryptographyService,
		private readonly contentTypeConstants: ContentTypeConstants,
		@Inject(LOGGER_PROVIDER)
		private readonly loggerProvider: LoggerProviderInterface,
	) {
		this.logger = this.loggerProvider.getLogger(FileController.name);
		const appConfigs = this.configService.get<ConfigsInterface['application']>('application')!;
		this.isTestEnv = appConfigs.environment === EnvironmentsEnum.TEST;
	}

	public async onModuleInit(): Promise<void> {
		if (!this.isTestEnv) {
			const reportsModuleRef = await this.lazyModuleLoader.load(() => ReportsModule);
			this.uploadService = await reportsModuleRef.resolve(UploadService, { id: 1 });
		}
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
		const {
			application: { OCTET_STREAM: streamContentType },
			text: { PLAIN: plainTextContentType },
		} = this.contentTypeConstants;

		const acceptableContentTypes = [streamContentType, plainTextContentType];
		const expectedContentType = headers.accept ?? '';
		const contentType = acceptableContentTypes.includes(expectedContentType) ? expectedContentType : streamContentType;

		try {
			const fileName = fileNameHeader ?? 'file';
			const filePath = filePathHeader ?? '';

			response.set({
				'Content-Type': contentType,
				'Content-Disposition': `attachment; filename="${fileName}"`,
			});

			if (this.isTestEnv) {
				const testBuffer = Buffer.from('TEST CONTENT', 'ascii');
				return new StreamableFile(testBuffer, { length: testBuffer.length, type: contentType });
			}

			const fileBuffer = await this.uploadService.getFile(filePath);
			return new StreamableFile(fileBuffer, { length: fileBuffer.length, type: contentType });
		} catch (error) {
			this.logger.error(error);
			throw error;
		}
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
		const {
			text: { PLAIN: plainTextContentType, CSV: csvContentType, XML: xmlContentType },
			application: { PDF: pdfContentType, JSON: jsonContentType, ZIP: zipContentType },
			image: { GIF: gifContentType, JPEG: jpegContentType, PNG: pngContentType, SVG_XML: svgContentType },
			audio: { MPEG: mpegAudioContentType, X_WAV: wavAudioContentType },
			video: { MPEG: mpegVideoContentType, MP4: mp4ContentType, WEBM: webmContentType },
			multipart: { FORM_DATA: formDataContentType },
		} = this.contentTypeConstants;

		const acceptableContentTypes = [
			plainTextContentType, csvContentType, xmlContentType,
			pdfContentType, jsonContentType, zipContentType,
			gifContentType, jpegContentType, pngContentType, svgContentType,
			mpegAudioContentType, wavAudioContentType,
			mpegVideoContentType, mp4ContentType, webmContentType,
			formDataContentType,
		];
		const expectedContentType = file.mimetype ?? headers.accept;
		const fileContentType = acceptableContentTypes.includes(expectedContentType) ? expectedContentType : plainTextContentType;

		try {
			const [fileSteam] = (fileNameHeader.length > 0 ? fileNameHeader : file.originalname).trim().split('.');
			const originalName = file.originalname.trim().split('.');
			const fileName = this.cryptographyService.changeBufferEncoding(fileSteam, 'utf8', 'ascii');
			const fileExtension = this.cryptographyService.changeBufferEncoding(originalName[originalName.length - 1], 'utf8', 'ascii');
			const fullFileName = `${fileName}.${fileExtension}`;

			if (this.isTestEnv)
				return {
					filePath: `upload/reports/${fullFileName}`,
					fileContentType,
					uploadTag: '',
				};

			const { uploadTag, filePath } = await this.uploadService.uploadReport(fullFileName, file);

			return {
				filePath,
				fileContentType,
				uploadTag,
			};
		} catch (error) {
			this.logger.error(error);
			throw error;
		}
	}
}
