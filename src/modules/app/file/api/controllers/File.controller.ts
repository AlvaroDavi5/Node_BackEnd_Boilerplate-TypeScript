import {
	OnModuleInit, Inject,
	Controller, Res,
	Get, Post, Headers,
	StreamableFile, UploadedFile, UseInterceptors, UseGuards,
} from '@nestjs/common';
import { LazyModuleLoader } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags, ApiBody, ApiProduces, ApiConsumes, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Logger } from 'winston';
import { Response } from 'express';
import { ReadStream } from 'fs';
import authSwaggerDecorator from '@api/decorators/authSwagger.decorator';
import exceptionsResponseDecorator from '@api/decorators/exceptionsResponse.decorator';
import CustomThrottlerGuard from '@api/guards/Throttler.guard';
import AuthGuard from '@api/guards/Auth.guard';
import ContentTypeConstants from '@common/constants/ContentType.constants';
import FileReaderHelper from '@common/utils/helpers/FileReader.helper';
import { LOGGER_PROVIDER, LoggerProviderInterface } from '@core/infra/logging/Logger.provider';
import ReportsModule from '@app/reports/reports.module';
import UploadService from '@app/reports/services/Upload.service';
import { EnvironmentsEnum } from '@common/enums/environments.enum';
import { ConfigsInterface } from '@core/configs/configs.config';


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
		private readonly contentTypeConstants: ContentTypeConstants,
		private readonly fileReaderHelper: FileReaderHelper,
		@Inject(LOGGER_PROVIDER)
		private readonly loggerProvider: LoggerProviderInterface,
	) {
		this.logger = this.loggerProvider.getLogger(FileController.name);
		const appConfigs: ConfigsInterface['application'] = this.configService.get<any>('application');
		this.isTestEnv = appConfigs.environment === EnvironmentsEnum.TEST;
	}

	public async onModuleInit(): Promise<void> {
		if (!this.isTestEnv) {
			const reportsModuleRef = await this.lazyModuleLoader.load(() => ReportsModule);
			this.uploadService = await reportsModuleRef.resolve(UploadService, { id: 1 });
		}
	}

	@ApiOperation({
		summary: 'Download License',
		description: 'Download MIT License',
		deprecated: false,
	})
	@Get('/license')
	@ApiOkResponse({
		schema: {
			example: 'MIT License Copyright (c) 2022 Álvaro Alves <alvaro.davisa@gmail.com> ...',
		},
		description: 'Downloadable file',
	})
	@ApiConsumes('application/json')
	@ApiProduces('application/octet-stream', 'text/plain')
	public getLicense(
		@Headers() headers: { [key: string]: string | undefined },
		@Res({ passthrough: true }) response: Response,
	): StreamableFile {
		const {
			application: { OCTET_STREAM: streamContentType },
			text: { PLAIN: plainTextContentType },
		} = this.contentTypeConstants;

		const acceptableContentTypes = [streamContentType, plainTextContentType];
		const expectedContentType = headers.accept ?? '';
		const contentType = acceptableContentTypes.includes(expectedContentType) ? expectedContentType : streamContentType;

		try {
			const fileName = 'LICENSE.txt';
			const filePath = 'src/dev/templates/LICENSE.txt';
			const readStream = this.fileReaderHelper.readStream(filePath);

			response.set({
				'Content-Type': contentType,
				'Content-Disposition': `attachment; filename="${fileName}"`,
			});

			return new StreamableFile(readStream as ReadStream);
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
				filename: 'file.txt',
				fileContentType: 'text/plain',
				downloadUrl: 'http://localhost:4566/defaultbucket/file.txt?Signature=XXX&Expires=000',
			},
		},
		description: 'Uploaded File',
	})
	@ApiConsumes('multipart/form-data')
	@ApiProduces('application/json')
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
	public async sendFile(
		@Headers() headers: { [key: string]: string | undefined },
		@Headers('fileName') fileNameHeader: string,
		@UploadedFile() file: Express.Multer.File,
	): Promise<{
		fileName: string,
		fileContentType: string,
		downloadUrl: string,
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
		const expectedContentType = headers.accept ?? file.mimetype;
		const fileContentType = acceptableContentTypes.includes(expectedContentType) ? expectedContentType : plainTextContentType;

		try {
			const fullFileName = (fileNameHeader.length > 0 ? fileNameHeader : file.originalname).trim().split('.');
			const fileSteam = Buffer.from(fullFileName[0]).toString('ascii');
			const fileExtension = Buffer.from(fullFileName[fullFileName.length - 1]).toString('ascii');
			const fileName = `${fileSteam}.${fileExtension}`;

			if (this.isTestEnv)
				return {
					fileName,
					fileContentType,
					downloadUrl: '',
				};

			await this.uploadService.uploadReport(fileName, file);
			const downloadUrl = await this.uploadService.getFileLink(fileName);

			return {
				fileName,
				fileContentType,
				downloadUrl,
			};
		} catch (error) {
			this.logger.error(error);
			throw error;
		}
	}
}
