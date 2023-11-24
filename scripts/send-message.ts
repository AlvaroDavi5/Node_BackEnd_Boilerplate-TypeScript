import sendEventMessage from '../src/dev/localstack/queues/sendEventMessage';
import configs from '../src/modules/core/configs/configs.config';


sendEventMessage({ logger: console, configs: configs() });
