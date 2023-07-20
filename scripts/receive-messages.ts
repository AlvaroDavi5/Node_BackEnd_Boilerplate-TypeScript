import createWebSocketClient from '../src/dev/websocket/createWebSocketClient';
import { WebSocketEventsEnum } from '../src/modules/app/domain/enums/webSocketEvents.enum';
import configs from '../src/configs/configs.config';


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

function createSocketClient() {
	logger.info(
		'\n # Creating socket client \n'
	);

	const webSocketClient = createWebSocketClient({
		logger,
		configs: configs(),
	});
	webSocketClient.send(WebSocketEventsEnum.RECONNECT, {
		dataValues: {
			clientId: 'localDev#1',
		},
	});
	webSocketClient.listen(WebSocketEventsEnum.EMIT, (msg: string) => {
		msg = formatMessageAfterReceiveHelper(msg);
		logger.info(msg);
	});
}


createSocketClient();
