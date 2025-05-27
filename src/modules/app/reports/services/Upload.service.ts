import { Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import S3Client from '@core/infra/integration/aws/S3.client';
import { ConfigsInterface } from '@core/configs/envs.config';
import Exceptions from '@core/errors/Exceptions';
import FileStrategy from '@app/file/strategies/File.strategy';
import FileReaderHelper from '@common/utils/helpers/FileReader.helper';
import DataParserHelper from '@common/utils/helpers/DataParser.helper';
import { RequestFileInterface } from '@shared/internal/interfaces/endpointInterface';


@Injectable({ scope: Scope.TRANSIENT })
export default class UploadService {
	private readonly fileStrategy: FileStrategy = new FileStrategy();
	private readonly uploadBucket: string;

	constructor(
		private readonly configService: ConfigService,
		private readonly s3Client: S3Client,
		private readonly fileReaderHelper: FileReaderHelper,
		private readonly dataParserHelper: DataParserHelper,
		private readonly exceptions: Exceptions,
	) {
		const s3Configs = this.configService.get<ConfigsInterface['integration']['aws']['s3']>('integration.aws.s3')!;
		this.uploadBucket = s3Configs.bucketName;
	}

	public async uploadFile(fileName: string, file: RequestFileInterface): Promise<{ filePath: string, uploadTag: string }> {
		let uploadTag = '';
		const fileEncoding = this.fileStrategy.defineEncoding(fileName, file.mimetype);
		const fileContent = this.fileReaderHelper.readFile(file.path, fileEncoding) ?? '';
		const fileBuffer = await this.dataParserHelper.toBuffer(fileContent, fileEncoding);
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

		const fileContentBuffer = await this.dataParserHelper.toBuffer(content, fileEncoding);
		return fileContentBuffer;
	}
}
