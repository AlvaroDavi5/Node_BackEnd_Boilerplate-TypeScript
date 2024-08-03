import { ConfigService } from '@nestjs/config';
import SqsClient from './SqsClient';
import { configServiceMock, cryptographyServiceMock, dataParserHelperMock, loggerProviderMock } from '@dev/mocks/mockedModules';


export default (queueName: string, queueUrl: string): void => {
	const sqsClient = new SqsClient(configServiceMock as unknown as ConfigService, cryptographyServiceMock, loggerProviderMock, dataParserHelperMock);

	try {
		sqsClient.createQueue(queueName).then((createdQueueUrl) => {
			console.debug('Queue URL:', createdQueueUrl);
		});
	} catch (error) {
		sqsClient.deleteQueue(queueUrl).then((wasDeleted) => {
			if (wasDeleted)
				sqsClient.createQueue(queueName).then((createdQueueUrl) => {
					console.debug('Queue URL:', createdQueueUrl);
				});
		});
	}
};
