import createWebSocketClient from '../src/dev/websocket/createWebSocketClient';
import { WebSocketEventsEnum } from '../src/modules/app/domain/enums/webSocketEvents.enum';
import configs from '../src/modules/core/configs/configs.config';


function formatMessageAfterReceiveHelper(message: any) {
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
	console.info(
		'\n # Creating socket client \n'
	);

	const webSocketClient = createWebSocketClient({
		logger: console,
		configs: configs(),
	});

	webSocketClient.listen(WebSocketEventsEnum.EMIT, (msg: unknown, ...args: unknown[]) => {
		const message = formatMessageAfterReceiveHelper(msg);
		console.info(message);
	});
	webSocketClient.send(WebSocketEventsEnum.RECONNECT, {
		dataValues: {
			clientId: 'localDev#1',
		},
		listen: {
			newConnections: true,
		},
	});
}


createSocketClient();
