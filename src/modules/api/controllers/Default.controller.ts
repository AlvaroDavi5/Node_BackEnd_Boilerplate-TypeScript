import {
	OnModuleInit,
	Controller, Req, Res,
	Get, Post, Headers, Param, Query, Body,
	StreamableFile, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { ModuleRef, LazyModuleLoader } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags, ApiBody, ApiProduces, ApiConsumes, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Logger } from 'winston';
import { Request, Response } from 'express';
import { Multer } from 'multer';
import { ReadStream } from 'fs';
import HttpConstants from '@api/constants/Http.constants';
import ContentTypeConstants from '@api/constants/ContentType.constants';
import FileReaderHelper from '@common/utils/helpers/FileReader.helper';
import LoggerGenerator from '@core/infra/logging/LoggerGenerator.logger';
import ReportsModule from '@reports/reports.module';
import UploadService from '@reports/services/Upload.service';
import { EnvironmentsEnum } from '@common/enums/environments.enum';
import { ConfigsInterface } from '@core/configs/configs.config';


@Controller()
export default class DefaultController implements OnModuleInit {
	private fileReaderHelper!: FileReaderHelper;
	private uploadService!: UploadService;
	private readonly logger: Logger;
	private readonly appConfigs: ConfigsInterface['application'];

	constructor(
		private readonly moduleRef: ModuleRef,
		private readonly lazyModuleLoader: LazyModuleLoader,
		private readonly configService: ConfigService,
		private readonly httpConstants: HttpConstants,
		private readonly contentTypeConstants: ContentTypeConstants,
		private readonly loggerGenerator: LoggerGenerator,
	) {
		this.logger = this.loggerGenerator.getLogger();
		this.appConfigs = this.configService.get<any>('application');
	}

	public async onModuleInit(): Promise<void> {
		this.fileReaderHelper = this.moduleRef.get(FileReaderHelper, { strict: false });
		if (this.appConfigs.environment !== EnvironmentsEnum.TEST) {
			const reportsModuleRef = await this.lazyModuleLoader.load(() => ReportsModule);
			this.uploadService = await reportsModuleRef.resolve(UploadService, { id: 1 });
		}
	}

	@ApiTags('HealthCheck')
	@ApiOperation({ summary: 'Check API' })
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
				statusMessage: 'Endpoint finded successfully',
			},
		}
	})
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

	@ApiTags('Files')
	@ApiOperation({ summary: 'Download License' })
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
	): StreamableFile | unknown {
		const {
			application: { OCTET_STREAM: streamContentType },
			text: { PLAIN: plainTextContentType },
		} = this.contentTypeConstants;

		const acceptableContentTypes = [streamContentType, plainTextContentType];
		const expectedContentType = headers.accept ?? '';

		try {
			const readStream = this.fileReaderHelper.readStream('src/dev/templates/LICENSE.txt');

			if (readStream)
				response.set({
					'Content-Type': acceptableContentTypes.includes(expectedContentType) ? expectedContentType : plainTextContentType,
					'Content-Disposition': 'attachment; filename="LICENSE.txt"',
				});

			return new StreamableFile(readStream as ReadStream);
		} catch (error) {
			this.logger.error(error);
			throw error;
		}
	}

	@ApiTags('Files')
	@ApiOperation({ summary: 'Upload File' })
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
	@ApiProduces(
		'text/plain', 'text/csv', 'text/xml',
		'application/pdf', 'application/json', 'application/zip',
		'image/gif', 'image/jpeg', 'image/png', 'image/svg+xml',
		'audio/mpeg', 'audio/x-wav',
		'video/mpeg', 'video/mp4', 'video/webm',
	)
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
	} | unknown> {
		const {
			text: { PLAIN: plainTextContentType, CSV: csvContentType, XML: xmlContentType },
			application: { PDF: pdfContentType, JSON: jsonContentType, ZIP: zipContentType },
			image: { GIF: gifContentType, JPEG: jpegContentType, PNG: pngContentType, SVG_XML: svgContentType },
			audio: { MPEG: mpegAudioContentType, X_WAV: wavAudioContentType },
			video: { MPEG: mpegVideoContentType, MP4: mp4ContentType, WEBM: webmContentType }
		} = this.contentTypeConstants;

		const acceptableContentTypes = [
			plainTextContentType, csvContentType, xmlContentType,
			pdfContentType, jsonContentType, zipContentType,
			gifContentType, jpegContentType, pngContentType, svgContentType,
			mpegAudioContentType, wavAudioContentType,
			mpegVideoContentType, mp4ContentType, webmContentType,
		];
		const responseAcceptHeader = headers.accept ?? file.mimetype;
		const expectedContentType = acceptableContentTypes.includes(responseAcceptHeader) ? responseAcceptHeader : plainTextContentType;

		try {
			const fullFileName = (fileNameHeader.length > 0 ? fileNameHeader : file.originalname).trim().split('.');
			const fileSteam = Buffer.from(fullFileName[0]).toString('ascii');
			const fileExtension = Buffer.from(fullFileName[fullFileName.length - 1]).toString('ascii');
			const fileName = `${fileSteam}.${fileExtension}`;

			if (this.appConfigs.environment === EnvironmentsEnum.TEST)
				return {
					fileName,
					fileContentType: expectedContentType,
					downloadUrl: '',
				};

			await this.uploadService.uploadReport(fileName, file);
			const downloadUrl = await this.uploadService.getFileLink(fileName);

			return {
				fileName,
				fileContentType: expectedContentType,
				downloadUrl,
			};
		} catch (error) {
			this.logger.error(error);
			throw error;
		}
	}
}
