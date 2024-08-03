import sendMessage from '@dev/localstack/queues/sendMessage';
import eventPayload from '@dev/templates/payloads/EventPayload.json';
import { configServiceMock } from '@dev/mocks/mockedModules';


const eventsQueue = configServiceMock.get('integration.aws.sqs.eventsQueue');

sendMessage('Events Queue', eventsQueue.queueUrl, eventPayload, 'mocked_message', 'backend');
