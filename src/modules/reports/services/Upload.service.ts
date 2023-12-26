import { Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Multer } from 'multer';
import S3Client from '@core/infra/integration/aws/S3.client';
import { ConfigsInterface } from '@core/configs/configs.config';
import FileStrategy from '@app/strategies/File.strategy';
import FileReaderHelper from '@common/utils/helpers/FileReader.helper';


@Injectable({ scope: Scope.TRANSIENT })
export default class UploadService {
	private readonly uploadBucket: string;

	constructor(
		private readonly configService: ConfigService,
		private readonly s3Client: S3Client,
		private readonly fileStrategy: FileStrategy,
		private readonly fileReaderHelper: FileReaderHelper,
	) {
		const s3Configs: ConfigsInterface['integration']['aws']['s3'] = this.configService.get<any>('integration.aws.s3');
		this.uploadBucket = s3Configs.bucketName || 'defaultbucket';
	}

	public async uploadReport(fileName: string, file: Express.Multer.File): Promise<string> {
		let tag = '';
		const fileContent = this.fileReaderHelper.readFile(
			file.path, this.fileStrategy.defineEncoding(fileName));

		if (fileContent && fileContent.length)
			tag = await this.s3Client.uploadFile(this.uploadBucket, fileName, fileContent);

		return tag;
	}

	public async getPresignedUrl(fileName: string): Promise<string> {
		return await this.s3Client.getFileLink(this.uploadBucket, fileName);
	}
}
