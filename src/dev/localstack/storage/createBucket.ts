import S3Client from './S3Client';
import { configServiceMock, loggerProviderMock } from '../../mocks/mockedModules';


export default (bucketName: string): void => {
	const s3Client = new S3Client(configServiceMock as any, loggerProviderMock);

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
