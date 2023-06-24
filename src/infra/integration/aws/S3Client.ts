import path from 'path';
import fs from 'fs';
import uuid from 'uuid';
import { Logger } from 'winston';
import { AWSError } from 'aws-sdk';
import {
	S3Client as S3AWSClient, S3ClientConfig, Bucket, NotificationConfiguration,
	ListBucketsCommand, CreateBucketCommand, DeleteBucketCommand, PutBucketNotificationConfigurationCommand, UploadPartCommand, GetObjectCommand, DeleteObjectCommand,
	UploadPartCommandInput, GetObjectCommandInput, DeleteObjectCommandInput,
} from '@aws-sdk/client-s3';
import { ContainerInterface } from 'src/types/_containerInterface';


export default class S3Client {
	private awsConfig: S3ClientConfig;
	private region: string;
	private s3: S3AWSClient;
	private logger: Logger;

	constructor({
		logger,
		configs,
	}: ContainerInterface) {
		const {
			region, sessionToken,
			accessKeyId, secretAccessKey,
		} = configs.integration.aws.credentials;
		const { endpoint, apiVersion } = configs.integration.aws.s3;

		this.awsConfig = {
			endpoint,
			region,
			apiVersion,
			credentials: {
				accessKeyId,
				secretAccessKey,
				sessionToken,
			},
			logger: configs.application.logging === 'true' ? logger : undefined,
		};
		this.region = region;
		this.s3 = new S3AWSClient(this.awsConfig);
		this.logger = logger;
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
			this.s3.send(new ListBucketsCommand({}), (err: AWSError, data) => {
				if (err) {
					this.logger.error('List Error:', err);
				}
				else {
					list = data?.Buckets || [];
				}
			});
		} catch (error) {
			this.logger.error(error);
		}

		return list;
	}

	async createBucket(bucketName: string): Promise<string> {
		let location = '';

		try {
			this.s3.send(new CreateBucketCommand({
				Bucket: bucketName,
				CreateBucketConfiguration: {
					LocationConstraint: this.region,
				},
			}), (err: AWSError, data) => {
				if (err) {
					this.logger.error('Create Error:', err);
				}
				else {
					location = data?.Location || '';
				}
			});
		} catch (error) {
			this.logger.error(error);
		}

		return location;
	}

	async deleteBucket(bucketName: string): Promise<number> {
		let httpStatusCode = 0;

		try {
			this.s3.send(new DeleteBucketCommand({ Bucket: bucketName }), (err: AWSError, data) => {
				if (err) {
					this.logger.error('Delete Error:', err);
				}
				else {
					httpStatusCode = data?.$metadata?.httpStatusCode || 0;
				}
			});
		} catch (error) {
			this.logger.error(error);
		}

		return httpStatusCode;
	}

	async putBucketNotification(bucketName: string, configuration: NotificationConfiguration | undefined): Promise<number> {
		let httpStatusCode = 0;

		try {
			this.s3.send(new PutBucketNotificationConfigurationCommand({
				Bucket: bucketName,
				NotificationConfiguration: configuration,
			}), (err: AWSError, data) => {
				if (err) {
					this.logger.error('Configure Error:', err);
				}
				else {
					httpStatusCode = data?.$metadata?.httpStatusCode || 0;
				}
			});
		} catch (error) {
			this.logger.error(error);
		}

		return httpStatusCode;
	}

	async uploadFile(bucketName: string, filePath: string): Promise<string> {
		let key = '';

		try {
			this.s3.send(new UploadPartCommand(this._uploadParams(bucketName, filePath)), (err: AWSError, data) => {
				if (err) {
					this.logger.error('Upload Error:', err);
				}
				else {
					key = data?.SSEKMSKeyId || '';
				}
			});
		} catch (error) {
			this.logger.error(error);
		}

		return key;
	}

	async downloadFile(bucketName: string, objectKey: string): Promise<number> {
		let contentLength = 0;

		try {
			this.s3.send(new GetObjectCommand(this._getObjectParams(bucketName, objectKey)), (err: AWSError, data) => {
				if (err) {
					this.logger.error('Download Error:', err);
				}
				else if (data?.Body) {
					fs.writeFile(`./${objectKey}`, `${data?.Body}`, err => {
						if (err) {
							this.logger.error('Save Error:', err);
						}
					});
				}
				if (data?.ContentLength) {
					contentLength = data?.ContentLength || 0;
				}
			});
		} catch (error) {
			this.logger.error(error);
		}

		return contentLength;
	}

	async deleteFile(bucketName: string, objectKey: string): Promise<boolean> {
		let marker = false;

		try {
			this.s3.send(new DeleteObjectCommand(this._getObjectParams(bucketName, objectKey)), (err: AWSError, data) => {
				if (err) {
					this.logger.error('Delete Error:', err);
				}
				else {
					marker = data?.DeleteMarker || false;
				}
			});
		} catch (error) {
			this.logger.error(error);
		}

		return marker;
	}
}
