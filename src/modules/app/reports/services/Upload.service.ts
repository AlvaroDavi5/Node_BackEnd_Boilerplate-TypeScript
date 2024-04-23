import { Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Multer } from 'multer';
import S3Client from '@core/infra/integration/aws/S3.client';
import { ConfigsInterface } from '@core/configs/configs.config';
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
	) {
		const s3Configs = this.configService.get<ConfigsInterface['integration']['aws']['s3']>('integration.aws.s3')!;
		this.uploadBucket = s3Configs.bucketName;
	}

	public async uploadReport(fileName: string, file: Express.Multer.File): Promise<string> {
		let tag = '';
		const fileContent = this.fileReaderHelper.readFile(
			file.path, this.fileStrategy.defineEncoding(fileName));

		if (fileContent && fileContent.length)
			tag = await this.s3Client.uploadFile(this.uploadBucket, fileName, fileContent);

		return tag;
	}

	public async getFileLink(fileName: string): Promise<string> {
		return await this.s3Client.getFileSignedUrl(this.uploadBucket, fileName);
	}
}
