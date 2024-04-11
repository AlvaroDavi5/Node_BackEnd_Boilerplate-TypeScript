import SqsClient from './SqsClient';
import { configServiceMock, cryptographyServiceMock, dataParserHelperMock, loggerProviderMock } from '../../mocks/mockedModules';


export default (queueName: string, queueUrl: string, payload: any, title: string, author: string): void => {
	const sqsClient = new SqsClient(configServiceMock as any, cryptographyServiceMock, loggerProviderMock, dataParserHelperMock);

	const message = {
		id: cryptographyServiceMock.generateUuid(),
		schema: 'INVALID',
		schemaVersion: 1,
		payload: payload,
		source: 'SCRIPT',
		timestamp: new Date(),
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
