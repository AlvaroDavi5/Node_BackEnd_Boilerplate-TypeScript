import sendEventMessage from '../src/dev/localstack/queues/sendEventMessage';
import configs from '../src/configs/configs.config';


const logger = console;

sendEventMessage({ logger, configs: configs() });
