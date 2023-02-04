import createWebSocketClient from '../dev/websocket/createWebSocketClient';
import webSocketEventsEnum from '../src/domain/enums/webSocketEventsEnum';
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
const formatMessageAfterReceiveHelper = {
	execute: (message) => {
		let msg = '';
		try {
			msg = JSON.parse(message);
		}
		catch (error) {
			msg = String(message);
		}
		return msg;
	}
};

async function createSocketClient() {
	logger.log(
		'\n # Creating socket client \n'
	);

	const webSocketClient = await createWebSocketClient({
		formatMessageBeforeSendHelper,
		logger,
		config,
	});
	webSocketClient.send(webSocketEventsEnum.CONNECTION_UPDATE, {
		token: 'Bearer xxx',
		dataValues: {
			clientId: 'localDev#1',
			userId: 1,
			merchantIds: [1, 2, 3],
		},
	});
	webSocketClient.listen(webSocketEventsEnum.ORDER_EMIT, (msg) => {
		msg = formatMessageAfterReceiveHelper.execute(msg);
		logger.log(msg);
	});
}


createSocketClient();
