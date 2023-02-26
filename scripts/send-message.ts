import sendEventMessage from '../dev/localstack/queues/sendEventMessage';
import configs from '../configs/configs';


const logger = console;

sendEventMessage({ logger, configs });
