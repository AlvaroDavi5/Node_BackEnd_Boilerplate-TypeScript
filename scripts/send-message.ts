import sendEventMessage from '../src/dev/localstack/queues/sendEventMessage';
import configs from '../src/configs/configs';


const logger = console;

sendEventMessage({ logger, configs: configs() });
