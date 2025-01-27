import { Injectable, StreamableFile } from '@nestjs/common';
import { LazyModuleLoader } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import CryptographyService from '@core/security/Cryptography.service';
import Exceptions from '@core/errors/Exceptions';
import { ConfigsInterface } from '@core/configs/envs.config';
import ReportsModule from '@app/reports/reports.module';
import UploadService from '@app/reports/services/Upload.service';
import ContentTypeConstants from '@common/constants/ContentType.constants';
import { EnvironmentsEnum } from '@common/enums/environments.enum';
import { RequestFileInterface } from '@shared/internal/interfaces/endpointInterface';


@Injectable()
export default class FileService {
	private uploadService!: UploadService;
	private readonly isTestEnv: boolean; // ! lazy loads not works in test environment

	constructor(
		private readonly lazyModuleLoader: LazyModuleLoader,
		private readonly configService: ConfigService,
		private readonly cryptographyService: CryptographyService,
		private readonly exceptions: Exceptions,
		private readonly contentTypeConstants: ContentTypeConstants,
	) {
		const appConfigs = this.configService.get<ConfigsInterface['application']>('application')!;
		this.isTestEnv = appConfigs.environment === EnvironmentsEnum.TEST;
	}

	public async onModuleInit(): Promise<void> {
		if (!this.isTestEnv) {
			const reportsModuleRef = await this.lazyModuleLoader.load(() => ReportsModule);
			this.uploadService = await reportsModuleRef.resolve(UploadService, { id: 1 });
		}
	}

	public async downloadFile(fileNameHeader: string, filePathHeader: string, acceptHeader = ''): Promise<{
		contentType: string, fileName: string,
		content: Buffer | StreamableFile | string,
	}> {
		const {
			application: { OCTET_STREAM: streamContentType },
			text: { PLAIN: plainTextContentType },
		} = this.contentTypeConstants;

		const acceptableContentTypes = [streamContentType, plainTextContentType];
		const contentType = acceptableContentTypes.includes(acceptHeader) ? acceptHeader : streamContentType;

		try {
			const fileName = fileNameHeader ?? 'file';
			const filePath = filePathHeader ?? '';

			if (this.isTestEnv) {
				const testBuffer = Buffer.from('TEST CONTENT', 'ascii');
				return {
					fileName, contentType,
					content: new StreamableFile(testBuffer, { length: testBuffer.length, type: contentType }),
				};
			}

			const fileBuffer = await this.uploadService.getFile(filePath);
			return {
				fileName, contentType,
				content: new StreamableFile(fileBuffer, { length: fileBuffer.length, type: contentType }),
			};
		} catch (error) {
			throw this.exceptions.internal({
				message: (error as Error).message,
			});
		}
	}

	public async uploadFile(file: RequestFileInterface, fileNameHeader: string, acceptHeader = ''): Promise<{
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
		const expectedContentType = file.mimetype ?? acceptHeader;
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

			const { uploadTag, filePath } = await this.uploadService.uploadFile(fullFileName, file);

			return {
				filePath,
				fileContentType,
				uploadTag,
			};
		} catch (error) {
			throw this.exceptions.internal({
				message: (error as Error).message,
			});
		}
	}
}
