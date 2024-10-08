import { ConfigService } from '@nestjs/config';
import { configServiceMock, loggerProviderMock } from '@dev/mocks/mockedModules';
import S3Client from './S3Client';


export default (bucketName: string): void => {
	const s3Client = new S3Client(configServiceMock as unknown as ConfigService, loggerProviderMock);

	try {
		s3Client.listBuckets().then((bucketList: string[]) => {
			if (!bucketList.includes(bucketName))
				s3Client.createBucket(bucketName).then((bucketLocation: string) => {
					console.debug('Bucket Location:', bucketLocation);
				});
		});
	} catch (error) {
		console.error(error);
	}
};
