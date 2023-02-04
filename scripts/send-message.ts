import sendOrderEventMessage from '../dev/localstack/queues/sendEventMessage';
import config from '../configs/configs';


const logger = console;
const formatMessageBeforeSendHelper = {
	execute: (message) => {
		let msg = '';
		try {
			msg = JSON.stringify(message);
		}
		catch (error) {
			msg = String(message);
		}
		return msg;
	}
};


sendOrderEventMessage({ formatMessageBeforeSendHelper, logger, config });
