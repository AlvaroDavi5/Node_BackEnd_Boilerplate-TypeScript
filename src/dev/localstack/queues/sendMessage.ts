import { ConfigService } from '@nestjs/config';
import { configServiceMock, cryptographyServiceMock, dataParserHelperMock, loggerProviderMock } from '@dev/mocks/mockedModules';
import SqsClient from './SqsClient';


export default (queueName: string, queueUrl: string, payload: unknown, title: string, author: string): void => {
	const sqsClient = new SqsClient(configServiceMock as unknown as ConfigService, loggerProviderMock, dataParserHelperMock);

	const message = {
		id: cryptographyServiceMock.generateUuid(),
		payload,
		schema: 'BROADCAST',
		schemaVersion: 0.1,
		source: 'script',
		timestamp: new Date('2024-06-10T03:52:50.885Z').toISOString(),
	};

	sqsClient.sendMessage({
		queueUrl,
		message,
		title,
		author,
		messageGroupId: 'TEST',
		messageDeduplicationId: cryptographyServiceMock.generateUuid(),
	}).then(() => {
		console.debug(`Sended message to ${queueName}`);
	});
};
