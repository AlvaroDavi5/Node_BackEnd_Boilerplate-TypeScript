import createQueue from '../src/dev/localstack/queues/createQueue';
import createBucket from '../src/dev/localstack/storage/createBucket';
import MockedExternalServers from '../src/dev/mockedExternalServers/index';
import { configServiceMock } from '../src/dev/mocks/mockedModules';


const eventsQueue = configServiceMock.get('integration.aws.sqs.eventsQueue');
const uploadBucketName = configServiceMock.get('integration.aws.s3.bucketName');

function mockServiceDependencies() {
	console.info(
		'\n # Mocking service dependencies... \n # Update your projects env file \n'
	);

	const externalServices = new MockedExternalServers();
	externalServices.start();

	createQueue(eventsQueue.queueName, eventsQueue.queueUrl);
	createBucket(uploadBucketName);
}

mockServiceDependencies();
