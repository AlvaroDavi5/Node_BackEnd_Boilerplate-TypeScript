import { Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import S3Client, { s3FileContentType } from '@core/infra/integration/aws/S3.client';
import { ConfigsInterface } from '@core/configs/envs.config';
import Exceptions from '@core/errors/Exceptions';
import FileStrategy from '@app/file/strategies/File.strategy';
import FileReaderHelper from '@common/utils/helpers/FileReader.helper';


@Injectable({ scope: Scope.TRANSIENT })
export default class UploadService {
	private readonly fileStrategy: FileStrategy = new FileStrategy();
	private readonly uploadBucket: string;

	constructor(
		private readonly configService: ConfigService,
		private readonly s3Client: S3Client,
		private readonly fileReaderHelper: FileReaderHelper,
		private readonly exceptions: Exceptions,
	) {
		const s3Configs = this.configService.get<ConfigsInterface['integration']['aws']['s3']>('integration.aws.s3')!;
		this.uploadBucket = s3Configs.bucketName;
	}

	private async parseToBuffer(content: s3FileContentType, inputEncoding: BufferEncoding): Promise<Buffer> {
		if (Buffer.isBuffer(content)) {
			return content;
		} else if (typeof content === 'string') {
			return Buffer.from(content, inputEncoding);
		} else if (content instanceof Readable) {
			const chunks: Uint8Array[] = [];
			for await (const chunk of content) {
				chunks.push(chunk);
			}
			return Buffer.concat(chunks);
		} else {
			throw this.exceptions.internal({
				message: 'Unsupported content type',
			});
		}
	}

	public async uploadReport(fileName: string, file: Express.Multer.File): Promise<{ filePath: string, uploadTag: string }> {
		let uploadTag = '';
		const fileEncoding = this.fileStrategy.defineEncoding(fileName, file.mimetype);
		const fileContent = this.fileReaderHelper.readFile(file.path, fileEncoding) ?? '';
		const fileBuffer = await this.parseToBuffer(fileContent, fileEncoding);
		const filePath = `upload/reports/${fileName}`;

		const isValidFile = fileBuffer?.length ?? fileContent?.length;
		if (isValidFile)
			uploadTag = await this.s3Client.uploadFile(this.uploadBucket, filePath, fileBuffer);

		return { filePath, uploadTag };
	}

	public async getFile(filePath: string): Promise<Buffer> {
		if (filePath.length <= 0)
			throw this.exceptions.contract({
				message: 'Invalid filePath',
			});

		const fileEncoding = this.fileStrategy.defineEncoding(filePath);
		const { content } = await this.s3Client.downloadFile(this.uploadBucket, filePath);

		if (!content)
			throw this.exceptions.notFound({
				message: 'File not founded!',
			});

		const fileContentBuffer = await this.parseToBuffer(content, fileEncoding);
		return fileContentBuffer;
	}
}
