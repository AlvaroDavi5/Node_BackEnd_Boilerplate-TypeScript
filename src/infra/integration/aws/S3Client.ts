import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import path from 'path';
import fs from 'fs';
import uuid from 'uuid';
import { Logger } from 'winston';
import {
	S3Client as S3AWSClient, S3ClientConfig, Bucket, NotificationConfiguration,
	ListBucketsCommand, CreateBucketCommand, DeleteBucketCommand, PutBucketNotificationConfigurationCommand, UploadPartCommand, GetObjectCommand, DeleteObjectCommand,
	UploadPartCommandInput, GetObjectCommandInput, DeleteObjectCommandInput,
} from '@aws-sdk/client-s3';
import { ConfigsInterface } from '@configs/configs';
import LoggerGenerator from '@infra/logging/logger';


@Injectable()
export default class S3Client {
	private awsConfig: S3ClientConfig;
	private region: string;
	private s3: S3AWSClient;
	private readonly logger: Logger;

	constructor(
		private readonly configService: ConfigService,
		private readonly loggerGenerator: LoggerGenerator,
	) {
		this.logger = this.loggerGenerator.getLogger();
		const awsConfigs: ConfigsInterface['integration']['aws'] = this.configService.get<any>('integration.aws');
		const logging: ConfigsInterface['application']['logging'] = this.configService.get<any>('application.logging');
		const {
			region, sessionToken,
			accessKeyId, secretAccessKey,
		} = awsConfigs.credentials;
		const { endpoint, apiVersion } = awsConfigs.s3;

		this.awsConfig = {
			endpoint,
			region,
			apiVersion,
			credentials: {
				accessKeyId: String(accessKeyId),
				secretAccessKey: String(secretAccessKey),
				sessionToken,
			},
			logger: logging === 'true' ? this.logger : undefined,
		};
		this.region = region || 'us-east-1';
		this.s3 = new S3AWSClient(this.awsConfig);
	}


	private _uploadParams(bucketName: string, filePath: string): UploadPartCommandInput {

		const params: UploadPartCommandInput = {
			Bucket: bucketName,
			Key: '',
			Body: '',
			PartNumber: 0,
			UploadId: uuid.v4(),
		};

		try {
			const fileBaseName = path.basename(filePath);
			const fileStream = fs.createReadStream(filePath);

			params.Key = fileBaseName;
			params.Body = fileStream;
		}
		catch (error) {
			this.logger.error(error);
		}

		return params;
	}

	private _getObjectParams(bucketName: string, objectKey: string): GetObjectCommandInput | DeleteObjectCommandInput {

		const params: GetObjectCommandInput | DeleteObjectCommandInput = {
			Bucket: bucketName,
			Key: objectKey,
			PartNumber: 0,
		};

		return params;
	}

	getClient(): S3AWSClient {
		return this.s3;
	}

	async listBuckets(): Promise<Bucket[]> {
		let list: Bucket[] = [];

		try {
			const result = await this.s3.send(new ListBucketsCommand({}));
			if (result?.Buckets)
				list = result?.Buckets;
		} catch (error) {
			this.logger.error('List Error:', error);
		}

		return list;
	}

	async createBucket(bucketName: string): Promise<string> {
		let location = '';

		try {
			const result = await this.s3.send(new CreateBucketCommand({
				Bucket: bucketName,
				CreateBucketConfiguration: {
					LocationConstraint: this.region,
				},
			}));
			if (result?.Location)
				location = result?.Location;
		} catch (error) {
			this.logger.error('Create Error:', error);
		}

		return location;
	}

	async deleteBucket(bucketName: string): Promise<number> {
		let httpStatusCode = 0;

		try {
			const result = await this.s3.send(new DeleteBucketCommand({ Bucket: bucketName }));
			if (result?.$metadata?.httpStatusCode)
				httpStatusCode = result.$metadata.httpStatusCode;
		} catch (error) {
			this.logger.error('Delete Error:', error);
		}

		return httpStatusCode;
	}

	async putBucketNotification(bucketName: string, configuration: NotificationConfiguration | undefined): Promise<number> {
		let httpStatusCode = 0;

		try {
			const result = await this.s3.send(new PutBucketNotificationConfigurationCommand({
				Bucket: bucketName,
				NotificationConfiguration: configuration,
			}));
			if (result?.$metadata?.httpStatusCode)
				httpStatusCode = result.$metadata.httpStatusCode;
		} catch (error) {
			this.logger.error('Configure Error:', error);
		}

		return httpStatusCode;
	}

	async uploadFile(bucketName: string, filePath: string): Promise<string> {
		let key = '';

		try {
			const result = await this.s3.send(new UploadPartCommand(this._uploadParams(bucketName, filePath)));
			if (result?.SSEKMSKeyId)
				key = result.SSEKMSKeyId;
		} catch (error) {
			this.logger.error('Upload Error:', error);
		}

		return key;
	}

	async downloadFile(bucketName: string, objectKey: string): Promise<number> {
		let contentLength = 0;

		try {
			const result = await this.s3.send(new GetObjectCommand(this._getObjectParams(bucketName, objectKey)));
			if (result?.Body) {
				fs.writeFile(`./${objectKey}`, `${result?.Body}`, err => {
					if (err) {
						this.logger.error('Save Error:', err);
					}
				});
			}
			if (result?.ContentLength) {
				contentLength = result.ContentLength;
			}
		} catch (error) {
			this.logger.error('Download Error:', error);
		}

		return contentLength;
	}

	async deleteFile(bucketName: string, objectKey: string): Promise<boolean> {
		let marker = false;

		try {
			const result = await this.s3.send(new DeleteObjectCommand(this._getObjectParams(bucketName, objectKey)));
			if (result?.DeleteMarker)
				marker = result.DeleteMarker;
		} catch (error) {
			this.logger.error('Delete Error:', error);
		}

		return marker;
	}
}
