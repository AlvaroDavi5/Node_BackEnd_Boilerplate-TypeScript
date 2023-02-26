import createWebSocketClient from '../dev/websocket/createWebSocketClient';
import webSocketEventsEnum from '../src/domain/enums/webSocketEventsEnum';
import configs from '../configs/configs';


const logger = console;

function formatMessageAfterReceiveHelper(message: string) {
	let msg = '';
	try {
		msg = JSON.parse(message);
	}
	catch (error) {
		msg = String(message);
	}
	return msg;
}

async function createSocketClient() {
	logger.info(
		'\n # Creating socket client \n'
	);

	const webSocketClient = await createWebSocketClient({
		logger,
		configs,
	});
	webSocketClient.send(webSocketEventsEnum.RECONNECT, {
		dataValues: {
			clientId: 'localDev#1',
		},
	});
	webSocketClient.listen(webSocketEventsEnum.EMIT, (msg: string) => {
		msg = formatMessageAfterReceiveHelper(msg);
		logger.info(msg);
	});
}


createSocketClient();
