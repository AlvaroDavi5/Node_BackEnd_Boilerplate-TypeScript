import { ConfigService } from '@nestjs/config';
import SqsClient from './SqsClient';
import { configServiceMock, cryptographyServiceMock, dataParserHelperMock, loggerProviderMock } from '@dev/mocks/mockedModules';


export default (queueName: string, queueUrl: string, payload: unknown, title: string, author: string): void => {
	const sqsClient = new SqsClient(configServiceMock as unknown as ConfigService, cryptographyServiceMock, loggerProviderMock, dataParserHelperMock);

	const message = {
		id: cryptographyServiceMock.generateUuid(),
		schema: 'INVALID',
		schemaVersion: 1,
		payload,
		source: 'SCRIPT',
		timestamp: new Date('2024-06-10T03:52:50.885Z'),
	};

	sqsClient.sendMessage(
		queueUrl,
		title,
		author,
		message,
	).then(() => {
		console.debug(`Sended message to ${queueName}`);
	});
};
