import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import {
	S3Client as S3AWSClient, S3ClientConfig, NotificationConfiguration,
	ListBucketsCommand, CreateBucketCommand, DeleteBucketCommand,
	PutBucketNotificationConfigurationCommand, PutObjectCommand, GetObjectCommand, DeleteObjectCommand,
	PutObjectCommandInput, GetObjectCommandInput, DeleteObjectCommandInput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigsInterface } from '@core/configs/envs.config';
import Exceptions from '@core/errors/Exceptions';
import LoggerService from '@core/logging/Logger.service';


export type s3FileContentType = string | Uint8Array | Buffer | Readable | ReadableStream | Blob;

@Injectable()
export default class S3Client {
	private readonly awsConfig: S3ClientConfig;
	private readonly s3Client: S3AWSClient;
	public readonly bucketName: string;
	private readonly filesExpiration: number;

	constructor(
		private readonly configService: ConfigService,
		private readonly exceptions: Exceptions,
		private readonly logger: LoggerService,
	) {
		const awsConfigs = this.configService.get<ConfigsInterface['integration']['aws']>('integration.aws')!;
		const showExternalLogs = this.configService.get<ConfigsInterface['application']['showExternalLogs']>('application.showExternalLogs')!;
		const {
			region, endpoint, sessionToken,
			accessKeyId, secretAccessKey,
		} = awsConfigs.credentials;
		const { bucketName, filesExpiration, apiVersion } = awsConfigs.s3;
		this.filesExpiration = filesExpiration;

		this.awsConfig = {
			endpoint,
			region,
			apiVersion,
			credentials: {
				accessKeyId: String(accessKeyId),
				secretAccessKey: String(secretAccessKey),
				sessionToken,
			},
			forcePathStyle: true,
			logger: showExternalLogs ? this.logger : undefined,
		};
		this.bucketName = bucketName;
		this.s3Client = new S3AWSClient(this.awsConfig);
	}

	private uploadParams(bucketName: string, fileName: string, fileContent: s3FileContentType, expirationDate?: Date): PutObjectCommandInput {
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
			if (result.Buckets?.length)
				result?.Buckets.map((bucket) => {
					if (bucket.Name)
						list.push(bucket.Name);
					return null;
				});
		} catch (error) {
			this.logger.error('List Error:', error);
			throw this.exceptions.integration(error as Error);
		}

		return list;
	}

	public async createBucket(bucketName: string): Promise<string> {
		let location = '';

		try {
			const result = await this.s3Client.send(new CreateBucketCommand({
				Bucket: bucketName,
			}));
			if (result?.Location)
				location = result?.Location;
			else
				location = '';
		} catch (error) {
			this.logger.error('Create Error:', error);
			throw this.exceptions.integration(error as Error);
		}

		return location;
	}

	public async deleteBucket(bucketName: string): Promise<number> {
		let statusCode = 0;

		try {
			const result = await this.s3Client.send(new DeleteBucketCommand({ Bucket: bucketName }));

			const { httpStatusCode } = result.$metadata;
			if (httpStatusCode)
				statusCode = httpStatusCode;
		} catch (error) {
			this.logger.error('Delete Error:', error);
			throw this.exceptions.integration(error as Error);
		}

		return statusCode;
	}

	public async putBucketNotification(bucketName: string, configuration: NotificationConfiguration | undefined): Promise<number> {
		let statusCode = 0;

		try {
			const result = await this.s3Client.send(new PutBucketNotificationConfigurationCommand({
				Bucket: bucketName,
				NotificationConfiguration: configuration,
			}));

			const { httpStatusCode } = result.$metadata;
			if (httpStatusCode)
				statusCode = httpStatusCode;
		} catch (error) {
			this.logger.error('Configure Error:', error);
			throw this.exceptions.integration(error as Error);
		}

		return statusCode;
	}

	public async uploadFile(bucketName: string, fileName: string, fileContent: s3FileContentType, expirationDate?: Date): Promise<string> {
		let tag = '';

		try {
			const result = await this.s3Client.send(new PutObjectCommand(this.uploadParams(bucketName, fileName, fileContent, expirationDate)));
			if (result?.ETag)
				tag = result.ETag;
		} catch (error) {
			this.logger.error('Upload Error:', error);
			throw this.exceptions.integration(error as Error);
		}

		return tag;
	}

	public async downloadFile(bucketName: string, objectKey: string): Promise<{ content: s3FileContentType | undefined, contentLength: number; }> {
		let content: s3FileContentType | undefined;
		let contentLength = 0;

		try {
			const result = await this.s3Client.send(new GetObjectCommand(this.getObjectParams(bucketName, objectKey)));
			if (!result.Body || !result.ContentLength) {
				throw this.exceptions.internal({
					message: 'Empty body',
				});
			}

			content = result.Body;
			contentLength = result.ContentLength;
		} catch (error) {
			this.logger.error('Download Error:', error);
			throw this.exceptions.integration(error as Error);
		}

		return {
			content,
			contentLength,
		};
	}

	public async getFileSignedUrl(bucketName: string, objectKey: string): Promise<string> {
		let link = '';

		try {
			const signedUrl = await getSignedUrl(this.s3Client, new GetObjectCommand(
				this.getObjectParams(bucketName, objectKey)
			), { expiresIn: this.filesExpiration });

			link = signedUrl;
		} catch (error) {
			this.logger.error('Get URL Error:', error);
			throw this.exceptions.integration(error as Error);
		}

		return link;
	}

	public async deleteFile(bucketName: string, objectKey: string): Promise<boolean> {
		let marker = false;

		try {
			const result = await this.s3Client.send(new DeleteObjectCommand(this.getObjectParams(bucketName, objectKey)));
			if (result?.DeleteMarker)
				marker = result.DeleteMarker;
		} catch (error) {
			this.logger.error('Delete Error:', error);
			throw this.exceptions.integration(error as Error);
		}

		return marker;
	}
}
