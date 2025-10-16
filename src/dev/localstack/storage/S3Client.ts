import { ConfigService } from '@nestjs/config';
import {
	S3Client as S3AWSClient, NotificationConfiguration,
	ListBucketsCommand, CreateBucketCommand, DeleteBucketCommand,
	PutBucketNotificationConfigurationCommand, PutObjectCommand, GetObjectCommand, DeleteObjectCommand,
	PutObjectCommandInput, GetObjectCommandInput, DeleteObjectCommandInput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigsInterface } from '@core/configs/envs.config';
import { LoggerInterface } from '@core/logging/logger';
import { isNullOrUndefined } from '@common/utils/dataValidations.util';
import { dataParserHelperMock } from '@dev/mocks/mockedModules';


export default class S3Client {
	private readonly s3Client: S3AWSClient;
	public readonly bucketName: string;
	private readonly filesExpiration: number;

	constructor(
		private readonly configService: ConfigService,
		private readonly logger: LoggerInterface,
	) {
		const { s3: { apiVersion, maxAttempts, bucketName, filesExpiration }, credentials: {
			region, endpoint, accessKeyId, secretAccessKey, sessionToken,
		} } = this.configService.get<ConfigsInterface['integration']['aws']>('integration.aws')!;
		const showExternalLogs = this.configService.get<ConfigsInterface['application']['showExternalLogs']>('application.showExternalLogs')!;

		this.bucketName = bucketName;
		this.filesExpiration = filesExpiration;

		this.s3Client = new S3AWSClient({
			forcePathStyle: true,
			endpoint, region, apiVersion, maxAttempts,
			credentials: { accessKeyId, secretAccessKey, sessionToken },
			logger: showExternalLogs ? this.logger : undefined,
		});
	}

	private uploadParams(bucketName: string, fileName: string, fileContent: Buffer, expirationDate?: Date): PutObjectCommandInput {
		const params: PutObjectCommandInput = {
			Bucket: bucketName,
			Key: fileName,
			Body: fileContent,
			Expires: expirationDate,
		};

		return params;
	}

	private getObjectParams(bucketName: string, objectKey: string): GetObjectCommandInput | DeleteObjectCommandInput {
		const params: GetObjectCommandInput | DeleteObjectCommandInput = {
			Bucket: bucketName,
			Key: objectKey,
		};

		return params;
	}

	public getClient(): S3AWSClient {
		return this.s3Client;
	}

	public destroy(): void {
		this.s3Client.destroy();
	}

	public async listBuckets(): Promise<string[]> {
		const list: string[] = [];

		try {
			const result = await this.s3Client.send(new ListBucketsCommand({}));

			if (result?.Buckets?.length)
				result.Buckets.forEach((bucket) => {
					if (bucket.Name)
						list.push(bucket.Name);
				});
		} catch (error) {
			throw this.caughtError(error);
		}

		return list;
	}

	public async createBucket(bucketName: string): Promise<string> {
		try {
			const result = await this.s3Client.send(new CreateBucketCommand({
				Bucket: bucketName,
			}));

			if (!result?.Location)
				throw new Error('Bucket not created');

			return result.Location;
		} catch (error) {
			throw this.caughtError(error);
		}
	}

	public async deleteBucket(bucketName: string): Promise<boolean> {
		try {
			const result = await this.s3Client.send(new DeleteBucketCommand({ Bucket: bucketName }));

			const statusCode = result?.$metadata?.httpStatusCode ?? 500;
			return statusCode >= 200 && statusCode < 300;
		} catch (error) {
			throw this.caughtError(error);
		}
	}

	public async putBucketNotification(bucketName: string, configuration: NotificationConfiguration | undefined): Promise<boolean> {
		try {
			const result = await this.s3Client.send(new PutBucketNotificationConfigurationCommand({
				Bucket: bucketName,
				NotificationConfiguration: configuration,
			}));

			const statusCode = result?.$metadata?.httpStatusCode ?? 500;
			return statusCode >= 200 && statusCode < 300;
		} catch (error) {
			throw this.caughtError(error);
		}
	}

	public async uploadFile(bucketName: string, fileName: string, fileContent: Buffer, expirationDate?: Date): Promise<string> {
		try {
			const result = await this.s3Client.send(new PutObjectCommand(this.uploadParams(bucketName, fileName, fileContent, expirationDate)));

			if (!result?.ETag)
				throw new Error('File not uploaded');

			return result.ETag;
		} catch (error) {
			throw this.caughtError(error);
		}
	}

	public async downloadFile(bucketName: string, objectKey: string): Promise<{ content: Buffer, contentLength: number; }> {
		let contentLength = 0;
		let content: Buffer;

		try {
			const result = await this.s3Client.send(new GetObjectCommand(this.getObjectParams(bucketName, objectKey)));

			if (!result.Body || !result.ContentLength)
				throw new Error('Empty body');

			contentLength = result.ContentLength;
			content = await dataParserHelperMock.toBuffer(result.Body, 'utf8');
		} catch (error) {
			throw this.caughtError(error);
		}

		return {
			content,
			contentLength,
		};
	}

	public async getFileSignedUrl(bucketName: string, objectKey: string): Promise<string> {
		try {
			const signedUrl = await getSignedUrl(this.s3Client, new GetObjectCommand(
				this.getObjectParams(bucketName, objectKey)
			), { expiresIn: this.filesExpiration });

			return signedUrl;
		} catch (error) {
			throw this.caughtError(error);
		}
	}

	public async deleteFile(bucketName: string, objectKey: string): Promise<boolean> {
		try {
			const result = await this.s3Client.send(new DeleteObjectCommand(this.getObjectParams(bucketName, objectKey)));

			if (isNullOrUndefined(result?.DeleteMarker))
				throw new Error('File not deleted');

			return result.DeleteMarker!;
		} catch (error) {
			throw this.caughtError(error);
		}
	}

	private caughtError(error: unknown): Error {
		this.logger.error(error);
		return new Error((error as Error)?.message ?? '');
	}
}
