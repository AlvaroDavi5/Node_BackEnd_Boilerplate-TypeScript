import sendMessage from '../src/dev/localstack/queues/sendMessage';
import eventPayload from '../src/dev/templates/payloads/EventPayload.json';
import { configServiceMock } from '../src/dev/mocks/mockedModules';


const eventsQueue = configServiceMock.get('integration.aws.sqs.eventsQueue');

sendMessage(
	'Events Queue', eventsQueue.queueUrl,
	eventPayload,
	'mocked_message', 'backend');
